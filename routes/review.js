const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const ExpressError= require("../utils/ExpressError.js");
const Product = require("../models/product.js");
const {validateReview, isLoggedIn , isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Reviews
  //Post route
  router.post("/" ,
    isLoggedIn,
    upload.array("images", 5),
    validateReview,
    wrapAsync (reviewController.createReview)); 
  
  // Delete Route
  router.delete("/:reviewId", 
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview));

  // Toggle Helpful Route
  router.put("/:reviewId/helpful",
    isLoggedIn,
    wrapAsync(reviewController.toggleHelpful));

  // Toggle Not Helpful Route
  router.put("/:reviewId/not-helpful",
    isLoggedIn,
    wrapAsync(reviewController.toggleNotHelpful));

  module.exports = router;