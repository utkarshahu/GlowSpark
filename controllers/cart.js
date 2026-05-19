const User = require("../models/user");

module.exports.viewCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('cart.product');
        const initialLength = user.cart.length;
        user.cart = user.cart.filter(item => item.product !== null && item.product !== undefined);
        if (user.cart.length !== initialLength) {
            await user.save();
        }
        res.status(200).json({ success: true, cart: user.cart });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

module.exports.addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        const existingItem = user.cart.find(item => item.product.toString() === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cart.push({ product: productId, quantity: 1 });
        }

        await user.save();
        
        // Populate before returning so frontend gets full product data
        await user.populate('cart.product');
        const initialLength = user.cart.length;
        user.cart = user.cart.filter(item => item.product !== null && item.product !== undefined);
        if (user.cart.length !== initialLength) {
            await user.save();
        }
        res.status(200).json({ success: true, message: "Product added to cart", cart: user.cart });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

module.exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user._id);

        user.cart = user.cart.filter(item => item.product && item.product.toString() !== productId);
        
        await user.save();
        await user.populate('cart.product');
        const initialLength = user.cart.length;
        user.cart = user.cart.filter(item => item.product !== null && item.product !== undefined);
        if (user.cart.length !== initialLength) {
            await user.save();
        }
        res.status(200).json({ success: true, message: "Product removed from cart", cart: user.cart });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

module.exports.clearCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.cart = [];
        await user.save();
        res.status(200).json({ success: true, message: "Cart cleared successfully" });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

module.exports.updateCartQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const user = await User.findById(req.user._id);

        const item = user.cart.find(item => item.product && item.product.toString() === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            await user.save();
        }

        await user.populate('cart.product');
        const initialLength = user.cart.length;
        user.cart = user.cart.filter(item => item.product !== null && item.product !== undefined);
        if (user.cart.length !== initialLength) {
            await user.save();
        }
        res.status(200).json({ success: true, message: "Cart quantity updated", cart: user.cart });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
