// models/Cart.js
import { Schema, model } from "mongoose";

const cartItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
});

const cartSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [cartItemSchema],
        totalPrice: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// 🔹 Middleware to auto-calc totalPrice before saving
cartSchema.pre("save", async function (next) {
    let total = 0;

    // populate product prices
    await this.populate("items.product");

    this.items.forEach((item) => {
        total += item.quantity * item.product.price; // assumes Product has "price" field
    });

    this.totalPrice = total;
    next();
});

export default model("Cart", cartSchema);
