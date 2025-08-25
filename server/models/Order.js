// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
            },
        ],
        totalPrice: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "paid", "shipped", "completed", "cancelled"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            enum: ["card", "bank_transfer", "cash_on_delivery", "mock"],
            default: "mock",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "successful", "failed"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
