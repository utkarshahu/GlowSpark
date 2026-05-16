const Product = require("../models/product");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let newReview = new Review(req.body.review);
        newReview.author = req.user._id;

        product.reviews.push(newReview);

        await newReview.save();
        await product.save();

        res.status(201).json({ success: true, message: "Review added successfully", review: newReview });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
}

module.exports.destroyReview = async (req, res) => {
    try {
        let { id, reviewId } = req.params;

        await Product.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        
        res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
}