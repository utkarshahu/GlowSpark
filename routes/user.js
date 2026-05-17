const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateProfile } = require("../middleware.js");
const userController = require("../controllers/users.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Wishlist routes
router.post("/wishlist/:productId", isLoggedIn, wrapAsync(userController.addToWishlist));
router.delete("/wishlist/:productId", isLoggedIn, wrapAsync(userController.removeFromWishlist));

// Profile routes
router.put("/:id", isLoggedIn, upload.single("avatar"), validateProfile, wrapAsync(userController.updateProfile));

module.exports = router;