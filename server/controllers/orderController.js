// controllers/orderController.js
import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js"; // ✅ install: npm i express-async-handler
import Cart from "../models/Cart.js";
import Product from "../models/Products.js";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import {
    initializePayment,
    verifyPayment,
} from "../services/paystackService.js";


// Checkout (creates order but does not deduct stock yet)
export const checkout = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Find user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
        return res.status(400).json({
            message: "Cart is empty",
        });
    }

    // Validate stock
    for (const item of cart.items) {
        if (item.quantity > item.product.stock) {
            return res.status(400).json({
                message: `Not enough stock for ${item.product.name}`,
            });
        }
    }

    // Calculate total
    let totalPrice = 0;

    cart.items.forEach((item) => {
        totalPrice += item.product.price * item.quantity;
    });

    // Generate a unique Paystack reference
    const reference = `LUXE-${userId}-${Date.now()}`;

    // Create pending order
    const order = new Order({
        user: userId,

        items: cart.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
        })),

        totalPrice,

        paymentMethod: "paystack",
        paymentStatus: "pending",
        status: "pending",

        paymentReference: reference,
    });

    await order.save();

    // Initialize Paystack payment
    const payment = await initializePayment({
        email: req.user.email,
        amount: Math.round(totalPrice * 100),
        reference,
        callbackUrl: `${process.env.FRONTEND_URL}/payment/callback`,
    });

    res.status(201).json({
        message: "Payment initialized successfully",
        orderId: order._id,
        reference,
        authorization_url: payment.data.authorization_url,
    });
});



// Confirm payment
export const confirmPayment = asyncHandler(async (req, res) => {
    const { reference } = req.body;

    if (!reference) {
        return res.status(400).json({
            message: "Payment reference is required",
        });
    }

    // Find the order using the Paystack reference
    const order = await Order.findOne({
        paymentReference: reference,
        user: req.user.id,
    });

    if (!order) {
        return res.status(404).json({
            message: "Order not found",
        });
    }

    // Prevent processing the same payment twice
    if (order.paymentStatus === "successful") {
        return res.status(400).json({
            message: "Order already paid",
        });
    }

    // Verify payment directly with Paystack
    const paymentResponse = await verifyPayment(reference);
    const paymentData = paymentResponse.data;

    if (
        paymentResponse.status !== true ||
        paymentData.status !== "success"
    ) {
        return res.status(400).json({
            message: "Payment was not successful",
        });
    }

    // Paystack amount is in kobo, while order total is in naira
    const expectedAmount = Math.round(order.totalPrice * 100);

    if (paymentData.amount !== expectedAmount) {
        return res.status(400).json({
            message: "Payment amount does not match order total",
        });
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Deduct stock atomically
        for (const item of order.items) {
            const product = await Product.findOneAndUpdate(
                {
                    _id: item.product,
                    stock: { $gte: item.quantity },
                },
                {
                    $inc: { stock: -item.quantity },
                },
                {
                    new: true,
                    session,
                }
            );

            if (!product) {
                throw new Error(
                    "Not enough stock available for one or more products"
                );
            }
        }

        // Update order
        order.paymentStatus = "successful";
        order.status = "paid";
        order.paidAt = new Date();

        await order.save({ session });

        // Clear the user's cart
        const cart = await Cart.findOne({
            user: req.user.id,
        }).session(session);

        if (cart) {
            cart.items = [];
            cart.totalPrice = 0;

            await cart.save({ session });
        }

        // Create notification
        await Notification.create(
            [
                {
                    userId: order.user,
                    type: "order_update",
                    message: `Payment confirmed for order ${ order._id }.`,
                },
            ],
            { session }
        );

        await session.commitTransaction();

        res.status(200).json({
            message: "Payment verified and order finalized",
            order,
        });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
});




// Get logged-in user's orders
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user.id })
        .populate("items.product", "name price imageUrl")
        .sort({ createdAt: -1 });

    res.json({ success: true, orders });
});

export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("items.product", "name price imageUrl");

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // make sure the user owns it
    if (order.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error("Not authorized");
    }

    res.json(order);
});



// Get all orders (admin)
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate("user", "name email")
        .populate("items.product", "name price")
        .sort({ createdAt: -1 });

    res.json({ success: true, orders });
});


// Update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    console.log("Updating order status for order:", order);

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    if (!["pending", "paid", "shipped", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    order.status = status;
    await order.save();

    await Notification.create({
        userId: order.user,
        type: "order_update",
        message: `Order ${order._id} status updated to ${status}.`,
    });

    res.json({ success: true, message: "Order updated", order });
});
