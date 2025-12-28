import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
    },
    { timestamps: true }
);


const productSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },    
    stock: {type: Number, required: true},
    inStock: { type: Boolean, default: true },
    imageUrl: { type: String},
    imagePublicId: { type: String },
    reviews: { type: [reviewSchema], default: [] },
    // ✅ Stored stats
    numReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
}, { timestamps: true });

export default model("Product", productSchema);
