import Cart from "../models/Cart.js";
import Product from "../models/Products.js";

// Add item to cart
export async function addToCart(req, res) {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Stock validation
        if (quantity > product.stock) {
            return res.status(400).json({ message: "Not enough stock available" });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [{ product: productId, quantity }],
            });
        } else {
            const itemIndex = cart.items.findIndex(
                (item) => item.product.toString() === productId
            );

            if (itemIndex > -1) {
                const newQuantity = cart.items[itemIndex].quantity + quantity;
                if (newQuantity > product.stock) {
                    return res
                        .status(400)
                        .json({ message: "Not enough stock available" });
                }
                cart.items[itemIndex].quantity = newQuantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Remove item from cart
export async function removeFromCart(req, res) {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter((item) => item.product.toString() !== productId);

        cart.totalPrice = await calculateTotal(cart.items);

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Update quantity
export async function updateCartItem(req, res) {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (quantity > product.stock) {
            return res.status(400).json({ message: "Not enough stock available" });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
        } else {
            return res.status(404).json({ message: "Item not in cart" });
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// Get user cart
export async function getUserCart(req, res) {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId }).populate("items.product", "name price");

        if (!cart) return res.status(404).json({ message: "Cart not found" });

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
export async function clearCart(req, res) {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = []; // remove all items
        await cart.save();

        res.status(200).json({ message: "Cart cleared successfully", cart });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

// helper function
async function calculateTotal(items) {
    let total = 0;
    for (const item of items) {
        const product = await findById(item.product);
        if (product) {
            total += product.price * item.quantity;
        }
    }
    return total;
}
