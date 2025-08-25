// routes/productRoutes.js
import express from "express"
const router = express.Router();
import { body } from "express-validator"
import { upload } from "../config/cloudinary.js"
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProduct,
} from "../controllers/productController.js"

import { protect, adminOnly } from "../middleware/authMiddleware.js"

router.get("/", getProducts);
router.get("/search", searchProduct);
router.get("/:id", getProduct);

router.post(
    "/",
    protect,
    adminOnly,
    upload.single("image"),// <-- handles image upload    
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("price").isNumeric().withMessage("Price must be a number"),
        body("category").notEmpty().withMessage("Category is required"),
        body("stock").isNumeric().withMessage("stock must be a number"),
    ],
    createProduct
);


router.put(
    "/:id",
    protect,
    adminOnly,
    upload.single("image"), // ✅ allow optional new image
    updateProduct
);
router.delete("/:id", protect, adminOnly, deleteProduct)




export default router;
