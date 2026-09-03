import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/ProductRoutes.js"
import userRoutes from "./routes/UserRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import OrderRoutes from "./routes/OrderRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import NotificationRoutes from "./routes/NotificationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";




const app = express();
connectDB();

// Global middlewares
app.use(helmet());
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        message: "Too many requests, try later.",
    })
);

const allowedOrigins = [
    "http://localhost:3000",
    process.env.FRONTEND_URL,
];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

app.use(express.json());
app.use(compression());
// app.use(mongoSanitize({ replaceWith: '_' }));
app.use(mongoSanitize({
    allowDots: true,
    replaceWith: '_',
    // dryRun: true, // <-- this prevents it from actually modifying anything
}));

// Routes
app.get("/", (req, res) => {
    res.json({
        message: "Home Decor API is running 🚀",
    });
});
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", OrderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", NotificationRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res, next) => {
    res.status(404);
    next(new Error(`Not Found - ${req.originalUrl}`));
});

// app.use((err, req, res, next) => {
//     console.error("Error:", err.message);
//     res.status(500).json({ error: err.message });
// });

// Error handler (last)
app.use(errorHandler);
// Global error handler
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
