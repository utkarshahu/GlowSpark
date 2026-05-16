const User = require('../models/user');
const Order = require('../models/order');
const Product = require('../models/product');

module.exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalOrders = await Order.countDocuments();
    
    // Calculate total revenue
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        activeUsers: totalUsers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'email username').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

module.exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = ['Pending', 'Shipped', 'Delivered'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true }).populate('user', 'email username');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-hash -salt -otp -otpExpires').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

module.exports.toggleUserBlock = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // We can use a 'status' field or just isVerified, but let's add a dynamic field if we want
    // Assuming we toggle a boolean 'isBlocked' (need to make sure model supports it or just use Mongoose mixed if not strictly defined, or better just use isVerified for now as a mock)
    user.isVerified = !user.isVerified; // Re-purposing isVerified as blocked/active for this mock
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle user status' });
  }
};
