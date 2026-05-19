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

        // Process uploaded images
        if (req.files && req.files.length > 0) {
            newReview.images = req.files.map(file => ({
                url: file.path,
                filename: file.filename
            }));
        }

        product.reviews.push(newReview);

        await newReview.save();
        await product.save();

        const populatedReview = await Review.findById(newReview._id).populate("author", "email role username profilePhoto");

        res.status(201).json({ success: true, message: "Review added successfully", review: populatedReview });
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

module.exports.toggleHelpful = async (req, res) => {
    try {
        let { reviewId } = req.params;
        const review = await Review.findById(reviewId);
        
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        const userId = req.user._id;
        const hasLiked = review.likes.includes(userId);

        if (hasLiked) {
            review.likes.pull(userId);
        } else {
            review.likes.push(userId);
            // Also remove from dislikes if present
            review.dislikes.pull(userId);
        }

        await review.save();

        res.status(200).json({ success: true, message: hasLiked ? "Removed helpful vote" : "Marked as helpful", review });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
}

module.exports.toggleNotHelpful = async (req, res) => {
    try {
        let { reviewId } = req.params;
        const review = await Review.findById(reviewId);
        
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        const userId = req.user._id;
        const hasDisliked = review.dislikes.includes(userId);

        if (hasDisliked) {
            review.dislikes.pull(userId);
        } else {
            review.dislikes.push(userId);
            // Also remove from likes if present
            review.likes.pull(userId);
        }

        await review.save();

        res.status(200).json({ success: true, message: hasDisliked ? "Removed not helpful vote" : "Marked as not helpful", review });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
}