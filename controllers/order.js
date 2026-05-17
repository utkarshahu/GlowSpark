const Order = require("../models/order");
const User = require("../models/user");

module.exports.placeOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body;
        const user = await User.findById(req.user._id).populate('cart.product');
        
        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: "Your account has been blocked from placing orders. Please contact support." });
        }

        if (user.cart.length === 0) {
            return res.status(400).json({ success: false, message: "Your cart is empty!" });
        }

        let totalAmount = 0;
        const orderProducts = [];

        for(let item of user.cart) {
            // Stock Reservation Logic
            if (item.product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Product ${item.product.title} is out of stock` });
            }
            item.product.stock -= item.quantity;
            item.product.orderCount += 1;
            await item.product.save();

            totalAmount += item.product.price * item.quantity;
            orderProducts.push({
                product: item.product._id,
                name: item.product.title,
                image: item.product.image?.url,
                quantity: item.quantity,
                price: item.product.price
            });
        }

        const order = new Order({
            user: req.user._id,
            products: orderProducts,
            totalAmount,
            shippingAddress,
            status: 'Processing'
        });

        await order.save();
        
        // Clear user cart
        user.cart = [];
        await user.save();

        res.status(201).json({ success: true, message: "Order placed successfully!", order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.viewOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('products.product');
        if(!order || !order.user.equals(req.user._id)) {
            return res.status(404).json({ success: false, message: "Order not found or unauthorized" });
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.orderHistory = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('products.product');
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.requestReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const { returnReason } = req.body;
        const order = await Order.findById(id);

        if (!order || !order.user.equals(req.user._id)) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.status !== 'Delivered') {
            return res.status(400).json({ success: false, message: "Returns are only available for delivered orders" });
        }

        // 14 day return window check
        const fourteenDaysInMs = 14 * 24 * 60 * 60 * 1000;
        if (new Date() - new Date(order.createdAt) > fourteenDaysInMs) {
            return res.status(400).json({ success: false, message: "Return window has expired (14 days max)" });
        }

        order.returnStatus = 'Requested';
        order.returnReason = returnReason;
        
        if (req.files && req.files.length > 0) {
            order.returnImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
        }
        
        await order.save();

        const io = req.app.get('io');
        if (io) {
            // Populate necessary fields for the admin view before emitting
            const populatedOrder = await Order.findById(order._id).populate('user', 'email username').populate('products.product', 'title image price');
            io.emit('returnRequested', populatedOrder);
        }

        res.status(200).json({ success: true, message: "Return requested successfully", order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.updateReturnStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { returnStatus } = req.body;
        const order = await Order.findById(id).populate('user', 'email username phoneNumber addresses createdAt').populate('products.product');

        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        order.returnStatus = returnStatus;
        
        // Automatic restock logic if return is Approved/Refunded
        if (returnStatus === 'Approved' || returnStatus === 'Refunded') {
            for(let item of order.products) {
                // we safely check if product exists (wasn't deleted)
                if (item.product) {
                    item.product.stock += item.quantity;
                    await item.product.save();
                }
            }
        }

        await order.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('orderStatusUpdated', order);
        }

        res.status(200).json({ success: true, message: `Return status updated to ${returnStatus}`, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
