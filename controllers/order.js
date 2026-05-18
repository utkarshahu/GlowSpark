const Order = require("../models/order");
const User = require("../models/user");

module.exports.placeOrder = async (req, res) => {
    try {
        const { shippingAddress, checkoutItems } = req.body;
        const user = await User.findById(req.user._id).populate('cart.product');
        
        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: "Your account has been blocked from placing orders. Please contact support." });
        }

        let itemsToOrder = [];
        let isDirectBuyOrPartial = false;

        if (checkoutItems && checkoutItems.length > 0) {
            isDirectBuyOrPartial = true;
            const Product = require("../models/product");
            for (let chItem of checkoutItems) {
                // Find product by id (safely supporting both item.product as object and item.product as ID string)
                const targetId = chItem.product?._id || chItem.product;
                const prod = await Product.findById(targetId);
                if (prod) {
                    itemsToOrder.push({
                        product: prod,
                        quantity: chItem.quantity
                    });
                }
            }
        } else {
            // Default: entire cart
            const initialLength = user.cart.length;
            user.cart = user.cart.filter(item => item.product !== null && item.product !== undefined);
            if (user.cart.length !== initialLength) {
                await user.save();
            }
            if (user.cart.length === 0) {
                return res.status(400).json({ success: false, message: "Your cart is empty!" });
            }
            itemsToOrder = user.cart;
        }

        if (itemsToOrder.length === 0) {
            return res.status(400).json({ success: false, message: "No products selected for checkout!" });
        }

        let totalAmount = 0;
        const orderProducts = [];

        for(let item of itemsToOrder) {
            // Stock Reservation Logic
            if (item.product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Product ${item.product.title} is out of stock` });
            }
            item.product.stock -= item.quantity;
            item.product.orderCount += 1;
            await item.product.save();

            totalAmount += item.product.price * item.quantity;
            
            // Resolve the product's main image from the images array
            const itemImage = item.product.images && item.product.images[item.product.thumbnailIndex || 0]
                ? item.product.images[item.product.thumbnailIndex || 0].url
                : (item.product.images && item.product.images[0]?.url);

            orderProducts.push({
                product: item.product._id,
                name: item.product.title,
                image: itemImage,
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
        
        // Remove only ordered items from user's cart if this came from direct/partial checkout
        if (isDirectBuyOrPartial) {
            const orderedProductIds = checkoutItems.map(ch => (ch.product?._id || ch.product).toString());
            user.cart = user.cart.filter(item => item.product && !orderedProductIds.includes(item.product._id.toString()));
            await user.save();
        } else {
            // Clear entire user cart
            user.cart = [];
            await user.save();
        }

        const io = req.app.get('io');
        if (io) {
            const populatedOrder = await Order.findById(order._id)
                .populate('user', 'email username')
                .populate('products.product', 'title image price');
            io.emit('newOrderPlaced', populatedOrder);
        }

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

module.exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancelReason } = req.body;
        const order = await Order.findById(id).populate('products.product');

        if (!order || !order.user.equals(req.user._id)) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.status !== 'Pending' && order.status !== 'Processing') {
            return res.status(400).json({ success: false, message: "Order cannot be cancelled once it is shipped or delivered." });
        }

        order.status = 'Cancelled';
        order.cancelReason = cancelReason;

        // Restore / Restock inventory
        for (let item of order.products) {
            if (item.product) {
                item.product.stock += item.quantity;
                item.product.orderCount = Math.max(0, item.product.orderCount - 1);
                await item.product.save();
            }
        }

        await order.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('orderStatusUpdated', order);
        }

        res.status(200).json({ success: true, message: "Order cancelled successfully!", order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
