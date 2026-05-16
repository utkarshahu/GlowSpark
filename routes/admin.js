const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn, isAdmin } = require('../middleware');
const adminController = require('../controllers/admin');
const orderController = require('../controllers/order');

// All routes here are protected by isLoggedIn and isAdmin
router.use(isLoggedIn, isAdmin);

router.get('/dashboard', wrapAsync(adminController.getDashboardStats));
router.get('/orders', wrapAsync(adminController.getAllOrders));
router.put('/orders/:orderId', wrapAsync(adminController.updateOrderStatus));
router.put('/orders/:id/return-status', wrapAsync(orderController.updateReturnStatus));
router.get('/users', wrapAsync(adminController.getAllUsers));
router.put('/users/:userId/block', wrapAsync(adminController.toggleUserBlock));

module.exports = router;
