const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: String,
    rating: {
        type : Number,
        min:1,
        max:5,
    },
    title: String,
    verifiedPurchase: {
        type: Boolean,
        default: false
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    dislikes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    adminReply: {
        type: String
    },
    images: [{
        url: String,
        filename: String
    }],
    isReported: {
        type: Boolean,
        default: false
    },
    author : {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

module.exports = mongoose.model("Review",reviewSchema);