import Cart from "../models/Cart.js";
import Product from "../models/Products.js";
import asyncHandler from "../middleware/asyncHandler.js";

// Add item to cart
export const addToCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    if (quantity > product.stock) {
        res.status(400);
        throw new Error("Not enough stock available");
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = new Cart({
            user: userId,
            items: [{ product: productId, quantity }],
        });
    } else {
        const itemIndex = cart.items.findIndex(
            (item) => item.product._id.toString() === productId
        );

        if (itemIndex > -1) {
            const newQuantity = cart.items[itemIndex].quantity + quantity;
            if (newQuantity > product.stock) {
                res.status(400);
                throw new Error("Not enough stock available");
            }
            cart.items[itemIndex].quantity = newQuantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }
    }

    cart.totalPrice = await calculateTotal(cart.items);
    await cart.save();

    res.json(cart);
});

// Remove item from cart
export const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    cart.totalPrice = await calculateTotal(cart.items);

    await cart.save();
    res.status(200).json(cart);
});

// Update quantity
export const updateCartItem = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    if (quantity > product.stock) {
        res.status(400);
        throw new Error("Not enough stock available");
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
    } else {
        res.status(404);
        throw new Error("Item not in cart");
    }

    cart.totalPrice = await calculateTotal(cart.items);
    await cart.save();

    res.json(cart);
});

// Get user cart
export const getUserCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId }).populate(
        "items.product",
        "name price"
    );

    if (!cart) {
        cart = {
            user: userId,
            items: [],
            totalPrice: 0,
        };
    }

    res.status(200).json(cart);
});

// Clear cart
export const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully", cart });
});

// Helper: calculate total
async function calculateTotal(items) {
    let total = 0;
    for (const item of items) {
        const product = await Product.findById(item.product);
        if (product) {
            total += product.price * item.quantity;
        }
    }
    return total;
}
