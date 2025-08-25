import { Schema, model } from "mongoose";

const productSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },    
    stock: {type: Number, required: true},
    inStock: { type: Boolean, default: true },
    imageUrl: { type: String},
    imagePublicId: { type: String }
}, { timestamps: true });

export default model("Product", productSchema);
