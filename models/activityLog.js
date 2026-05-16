const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activityLogSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false // System actions might not have a specific user
    },
    action: {
        type: String,
        required: true // e.g., 'PRODUCT_CREATED', 'ORDER_STATUS_UPDATED', 'COUPON_APPLIED'
    },
    details: {
        type: Schema.Types.Mixed,
        default: {} // e.g., { productId: '...', oldPrice: 10, newPrice: 15 }
    },
    entityType: {
        type: String, // e.g., 'Order', 'Product', 'User', 'System'
        required: true
    },
    entityId: {
        type: Schema.Types.ObjectId,
        required: false
    },
    ipAddress: String
}, { timestamps: true });

// Create indexes for efficient dashboard querying
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
