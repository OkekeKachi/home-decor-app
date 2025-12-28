// routes/reviewRoutes.js
import express from "express";
import { addReview, getReviews, deleteReview, getTopRatedProducts, canUserReview} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// /api/products/:id/reviews
router.post("/:id", protect, addReview, canUserReview);
router.get("/:id", getReviews);
router.delete("/:productId/reviews/:reviewId", protect, deleteReview);
router.get("/top-rated/all", getTopRatedProducts);
export default router;
