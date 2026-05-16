const express = require("express");
const router = express.Router();
const couponController = require("../controllers/coupons.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isAdmin } = require("../middleware.js");

// User Routes
router.post("/apply", isLoggedIn, wrapAsync(couponController.applyCoupon));

// Admin Routes
router.get("/", isLoggedIn, isAdmin, wrapAsync(couponController.getAllCoupons));
router.post("/", isLoggedIn, isAdmin, wrapAsync(couponController.createCoupon));
router.put("/:id", isLoggedIn, isAdmin, wrapAsync(couponController.updateCoupon));
router.delete("/:id", isLoggedIn, isAdmin, wrapAsync(couponController.deleteCoupon));

module.exports = router;
