const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const salesHistorySchema = new Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    totalProductsSold: {
        type: Number,
        default: 0
    },
    categoryBreakdown: {
        type: Map,
        of: Number,
        default: {}
    }
}, { timestamps: true });

// Add index for fast querying by date ranges
salesHistorySchema.index({ date: 1 });

module.exports = mongoose.model("SalesHistory", salesHistorySchema);
