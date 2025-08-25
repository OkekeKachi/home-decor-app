// controllers/orderController.js
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Products.js";
import Order from "../models/Order.js";

// Checkout (creates order but does not deduct stock yet)
export const checkout = async (req, res) => {
    try {
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
            status: "pending",       // order itself
            paymentStatus: "pending" // waiting for payment
        });

        await order.save();

        // Do NOT reduce stock here
        // Stock will be reduced only when payment is confirmed

        // Clear cart
        cart.items = [];
        await cart.save();

        res.status(201).json({
            message: "Checkout successful. Awaiting payment.",
            order,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// controllers/orderController.js

export const confirmPayment = async (req, res) => {
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

        // Deduct stock atomically for all items
        for (let item of order.items) {
            const product = await Product.findOneAndUpdate(
                { _id: item.product._id, stock: { $gte: item.quantity } }, // check stock
                { $inc: { stock: -item.quantity } },                       // decrement stock
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

        await session.commitTransaction();
        session.endSession();

        res.json({ message: "Payment confirmed, order finalized", order });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Payment error:", error);
        res.status(400).json({ message: error.message });
    }
};

// controllers/orderController.js
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate("items.product", "name price imageUrl") // show product details
            .sort({ createdAt: -1 }); // newest first

        res.json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// controllers/orderController.js
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email") // show user info
            .populate("items.product", "name price")
            .sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


// controllers/orderController.js
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // validate status
        if (!["pending", "paid", "shipped", "completed", "cancelled"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        order.status = status;
        await order.save();

        res.json({ success: true, message: "Order updated", order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
