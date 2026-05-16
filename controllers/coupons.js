const Coupon = require("../models/coupon");
const Order = require("../models/order");

// User validation and application
module.exports.applyCoupon = async (req, res) => {
    try {
        const { code, cartTotal, category } = req.body;
        
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Invalid coupon code" });
        }

        if (!coupon.isValid()) {
            return res.status(400).json({ success: false, message: "This coupon is expired or inactive" });
        }

        if (cartTotal < coupon.minOrderValue) {
            return res.status(400).json({ success: false, message: `Minimum order value of ₹${coupon.minOrderValue} required` });
        }

        if (coupon.applicableCategory !== 'All' && category && coupon.applicableCategory !== category) {
             return res.status(400).json({ success: false, message: `This coupon is only valid for ${coupon.applicableCategory} products` });
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountPercent > 0) {
            discountAmount = (cartTotal * coupon.discountPercent) / 100;
        } else if (coupon.flatDiscount > 0) {
            discountAmount = coupon.flatDiscount;
        }

        // Ensure discount doesn't exceed total
        discountAmount = Math.min(discountAmount, cartTotal);

        res.status(200).json({ 
            success: true, 
            message: "Coupon applied successfully",
            couponId: coupon._id,
            discountAmount 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin CRUD
module.exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.createCoupon = async (req, res) => {
    try {
        const newCoupon = new Coupon(req.body);
        await newCoupon.save();
        res.status(201).json({ success: true, message: "Coupon created successfully", coupon: newCoupon });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Coupon code already exists" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
        res.status(200).json({ success: true, message: "Coupon updated", coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByIdAndDelete(id);
        if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
        res.status(200).json({ success: true, message: "Coupon deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
