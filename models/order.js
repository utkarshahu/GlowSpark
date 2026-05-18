const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: false
            },
            name: {
                type: String,
                required: true
            },
            image: {
                type: String
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    shippingAddress: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    returnStatus: {
        type: String,
        enum: ['None', 'Requested', 'Under Review', 'Approved', 'Pickup Scheduled', 'Refunded', 'Rejected'],
        default: 'None'
    },
    returnReason: {
        type: String
    },
    cancelReason: {
        type: String
    },
    returnImages: [
        {
            url: String,
            filename: String
        }
    ],
    couponApplied: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon'
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
