const Product = require("./models/product");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { productSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: "You must be logged in to perform this action" });
    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: "You are not authorized to perform this action" });
    }
}

module.exports.validateProduct = (req, res, next) => {
    let { error } = productSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author._id.equals(req.user._id)) {
        return res.status(403).json({ success: false, message: "You are not authorized to edit this review" });
    }
    next();
}

const { userSignupSchema, userLoginSchema, userProfileSchema } = require("./schema.js");

module.exports.validateSignup = (req, res, next) => {
    let { error } = userSignupSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateLogin = (req, res, next) => {
    let { error } = userLoginSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateProfile = (req, res, next) => {
    let { error } = userProfileSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};