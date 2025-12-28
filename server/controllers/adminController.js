import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Products.js";
import asyncHandler from "../middleware/asyncHandler.js";

// 📊 Admin Dashboard Stats
export const getAdminStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalSales = await Order.aggregate([
        { $match: { status: "delivered" } }, // only count delivered sales
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const ordersByStatus = await Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
        totalUsers,
        totalOrders,
        totalSales: totalSales[0]?.total || 0,
        ordersByStatus,
    });
});

// 🏆 Top Products
export const getTopProducts = asyncHandler(async (req, res) => {
    const topProducts = await Order.aggregate([
        { $unwind: "$items" }, // break array into docs
        {
            $group: {
                _id: "$items.product",
                totalQuantity: { $sum: "$items.quantity" },
            },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "product",
            },
        },
        { $unwind: "$product" },
        {
            $project: {
                productId: "$product._id",
                name: "$product.name",
                totalQuantity: 1,
            },
        },
    ]);

    res.json(topProducts);
});
