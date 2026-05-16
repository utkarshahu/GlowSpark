const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isAdmin, validateProduct } = require("../middleware.js");
const productController = require("../controllers/products.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage })

router
  .route("/")
  .get(wrapAsync(productController.index))
  .post(
    isLoggedIn,
    isAdmin,
    upload.single("product[image]"),
    validateProduct,
    wrapAsync(productController.createProduct)
  );

router.route("/:id")
  .get(wrapAsync(productController.showProduct))
  .put(
    isLoggedIn,
    isAdmin,
    upload.single("product[image]"),
    validateProduct,
    wrapAsync(productController.updateProduct)
  )
  .delete(
    isLoggedIn,
    isAdmin,
    wrapAsync(productController.destroyProduct)
  );

module.exports = router;