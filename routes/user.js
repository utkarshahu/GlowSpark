const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { isLoggedIn } = require("../middleware.js");
const userController = require("../controllers/users.js");

// Wishlist routes
router.post("/wishlist/:productId", isLoggedIn, wrapAsync(userController.addToWishlist));
router.delete("/wishlist/:productId", isLoggedIn, wrapAsync(userController.removeFromWishlist));

module.exports = router;