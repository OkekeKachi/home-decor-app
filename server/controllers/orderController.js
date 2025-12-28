// controllers/orderController.js
import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js"; // ✅ install: npm i express-async-handler
import Cart from "../models/Cart.js";
import Product from "../models/Products.js";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";

// Checkout (creates order but does not deduct stock yet)
export const checkout = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Find user cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate stock
    for (let item of cart.items) {
        if (item.quantity > item.product.stock) {
            return res
                .status(400)
                .json({ message: `Not enough stock for ${item.product.name}` });
        }
    }

    // Calculate total
    let totalPrice = 0;
    cart.items.forEach((item) => {
        totalPrice += item.product.price * item.quantity;
    });

    // Create order (status: pending)
    const order = new Order({
        user: userId,
        items: cart.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
        })),
        totalPrice,
        paymentMethod: req.body.paymentMethod || "mock",
        status: "pending",
        paymentStatus: "pending",
    });

    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    // Notify user
    await Notification.create({
        userId,
        type: "order_update",
        message: `Order ${order._id} created. Please complete payment.`,
    });

    res.status(201).json({
        message: "Checkout successful. Awaiting payment.",
        order,
    });
});


// Confirm payment
export const confirmPayment = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId).populate("items.product").session(session);

        if (!order) {
            throw new Error("Order not found");
        }

        if (order.paymentStatus === "paid") {
            throw new Error("Order already paid");
        }

        // Deduct stock atomically
        for (let item of order.items) {
            const product = await Product.findOneAndUpdate(
                { _id: item.product._id, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true, session }
            );

            if (!product) {
                throw new Error(`Not enough stock for ${item.product.name}`);
            }
        }

        // Update order status
        order.paymentStatus = "successful";
        order.status = "paid";
        await order.save({ session });

        await Notification.create([{
            userId: order.user,
            type: "order_update",
            message: `Payment confirmed for order ${order._id}.`,
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.json({ message: "Payment confirmed, order finalized", order });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error; // asyncHandler will forward this to global error middleware
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
