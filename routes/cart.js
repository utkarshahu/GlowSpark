const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const cartController = require("../controllers/cart.js");

router.get("/", isLoggedIn, wrapAsync(cartController.viewCart));
router.post("/add", isLoggedIn, wrapAsync(cartController.addToCart));
router.post("/remove/:productId", isLoggedIn, wrapAsync(cartController.removeFromCart));
router.delete("/clear", isLoggedIn, wrapAsync(cartController.clearCart));

module.exports = router;
