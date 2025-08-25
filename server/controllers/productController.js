// controllers/productController.js
import { cloudinary } from "../config/cloudinary.js"
import Product from "../models/Products.js"
import { validationResult } from "express-validator"
import asyncHandler from "../middleware/asyncHandler.js"
import { login } from "./authController.js";

// @desc Get all products
// @route GET /api/products
// @access Public
export const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find();
    
    res.json({ success: true, data: products });
});

// @desc Get single product
// @route GET /api/products/:id
// @access Public
export const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }
    res.json({ success: true, data: product });
});

// @desc Create product
// @route POST /api/products
// @access Admin
export const createProduct = asyncHandler(async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array().map((e) => e.msg).join(", "),
            });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        console.log("Uploaded file:", req.file);

        const { name, price, category, description, stock } = req.body;

        const product = new Product({
            name,
            price,
            category,
            description,
            stock,
            imageUrl: req.file.path,        // ✅ Cloudinary URL
            imagePublicId: req.file.filename, // ✅ Cloudinary public_id
        });

        await product.save();

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        console.error("❌ Error creating product:");
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);

        if (req.file) {
            console.error("File that caused error:", req.file);
        }

        if (req.file?.filename) {
            await cloudinary.uploader.destroy(req.file.filename);
            console.warn(`⚠️ Rolled back new upload: ${req.file.filename}`);
        }

        res.status(500).json({ success: false, message: error.message });
    }

});



// @desc Update product
// @route PUT /api/products/:id
// @access Admin
// @desc Update product
export const updateProduct = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // basic field updates
        const fields = ["name", "price", "category", "description"];
        fields.forEach((f) => {
            if (req.body[f] !== undefined) product[f] = req.body[f];
        });

        // if a new image was uploaded
        if (req.file) {
            const newPublicId = req.file.filename;

            // try to delete old one first
            if (product.imagePublicId) {
                const result = await cloudinary.uploader.destroy(product.imagePublicId);

                if (result.result !== "ok") {
                    // ❌ rollback: delete the new upload since we can’t use it
                    await cloudinary.uploader.destroy(newPublicId);

                    return res.status(500).json({
                        message:
                            "Old image could not be deleted. New upload rolled back.",
                    });
                }

                console.log(`✅ Deleted old image: ${product.imagePublicId}`);
            }

            // assign new image only after success
            product.imageUrl = req.file.path;
            product.imagePublicId = newPublicId;
        }

        await product.save();
        res.json({ success: true, data: product });
    } catch (error) {
        console.error("❌ Error updating product:", error);

        // rollback in case something failed after new image upload
        if (req.file?.filename) {
            await cloudinary.uploader.destroy(req.file.filename);
            console.warn(`⚠️ Rolled back new upload: ${req.file.filename}`);
        }

        res.status(500).json({ message: "Server error" });
    }
});



// @desc Delete product
// @route DELETE /api/products/:id
// @access Admin

export const deleteProduct = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // If product has image, try deleting it from Cloudinary
        if (product.imagePublicId) {
            const result = await cloudinary.uploader.destroy(product.imagePublicId);

            if (result.result !== "ok") {
                console.warn(`⚠️ Failed to delete image ${product.imagePublicId}:`, result);
                return res.status(500).json({
                    message: "Image could not be deleted from Cloudinary. Product not removed.",
                });
            }

            console.log(`✅ Deleted image from Cloudinary: ${product.imagePublicId}`);
        }

        // If Cloudinary deletion succeeded OR no image exists → delete product in DB
        await Product.findByIdAndDelete(req.params.id);

        res.json({ message: "Product and image deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting product:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// search route
export const searchProduct = asyncHandler(async (req, res) => {
    try {
        console.log("hello");
        console.log(req.query);

        const { q } = req.query; // ?q=chair
        const products = await Product.find({
            name: { $regex: q, $options: "i" } // case-insensitive
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Search failed" });
    }
})
