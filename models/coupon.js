const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const couponSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    flatDiscount: {
        type: Number,
        min: 0,
        default: 0
    },
    minOrderValue: {
        type: Number,
        default: 0,
        min: 0
    },
    expiresAt: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: null // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    },
    applicableCategory: {
        type: String, // e.g., 'Skincare', or 'All'
        default: 'All'
    },
    autoApply: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Auto-disable expired coupons
couponSchema.methods.isValid = function() {
    if (!this.active) return false;
    
    // Set expiry to end of day to prevent same-day invalidation due to time offsets
    const expiryEOD = new Date(this.expiresAt);
    expiryEOD.setHours(23, 59, 59, 999);
    
    if (expiryEOD < new Date()) return false;
    
    if (this.usageLimit !== null && this.usedCount >= this.usageLimit) return false;
    return true;
};

module.exports = mongoose.model("Coupon", couponSchema);
