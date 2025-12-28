// controllers/reviewController.js
import Product from "../models/Products.js";
import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/Order.js";
// Add a review
export const addReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    // 1. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    // 2. Check if user purchased this product
    const hasOrdered = await Order.findOne({
        user: req.user._id,
        "items.product": productId,
        status: "completed", // ✅ only allow review after completion
    });

    if (!hasOrdered) {
        return res
            .status(403)
            .json({ message: "You can only review products you purchased" });
    }

    // 3. Check if user already reviewed
    const existingReview = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
        // ✅ Update existing review
        existingReview.rating = Number(rating);
        existingReview.comment = comment;
    } else {
        // ✅ Add new review
        product.reviews.push({
            user: req.user._id,
            rating: Number(rating),
            comment,
        });
    }

    // 4. Update stats
    product.numReviews = product.reviews.length;
    product.averageRating =
        product.reviews.reduce((acc, r) => acc + r.rating, 0) /
        product.reviews.length;

    await product.save();

    res.status(201).json({
        message: existingReview ? "Review updated" : "Review added",
        reviews: product.reviews,
        numReviews: product.numReviews,
        averageRating: product.averageRating,
    });
});


export const canUserReview = asyncHandler(async (req, res) => {
    const productId = req.params.id;

    const hasOrdered = await Order.findOne({
        user: req.user._id,
        "items.product": productId,
        status: "completed",
    });

    res.json({ canReview: !!hasOrdered });
});

// Get reviews for a product
export const getReviews = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate(
        "reviews.user",
        "username email"
    );

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.json(product.reviews);
});

// Delete review (admin or owner)
export const deleteReview = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    product.reviews = product.reviews.filter(
        (r) => r._id.toString() !== req.params.reviewId
    );

    product.numReviews = product.reviews.length;
    product.averageRating =
        product.reviews.reduce((acc, r) => acc + r.rating, 0) /
        (product.reviews.length || 1);

    await product.save();
    res.json({ message: "Review removed" });
});

// Get top-rated products
export const getTopRatedProducts = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 5;

    const products = await Product.find({})
        .sort({ averageRating: -1, numReviews: -1 }) // highest rating first
        .limit(limit)
        .select("name price imageUrl averageRating numReviews");

    res.json(products);
});