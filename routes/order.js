const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const orderController = require("../controllers/order.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.post("/", isLoggedIn, wrapAsync(orderController.placeOrder));
router.get("/:id", isLoggedIn, wrapAsync(orderController.viewOrder));
router.get("/", isLoggedIn, wrapAsync(orderController.orderHistory));
router.post("/:id/return", isLoggedIn, upload.array('images', 5), wrapAsync(orderController.requestReturn));

module.exports = router;
