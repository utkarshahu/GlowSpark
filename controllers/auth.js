const User = require("../models/user");

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        
        // Ensure email isn't already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "A user with the given email is already registered" });
        }

        const userCount = await User.countDocuments();
        const role = userCount === 0 ? 'admin' : 'customer';

        const newUser = new User({ email, username, role });
        
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            res.status(201).json({ success: true, message: "Welcome to Glow Spark!", user: registeredUser, sessionId: req.sessionID });
        });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

module.exports.login = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist', '_id');
        const validWishlistIds = user.wishlist.filter(p => p !== null).map(p => p._id);
        if (validWishlistIds.length !== req.user.wishlist.length) {
            req.user.wishlist = validWishlistIds;
            await req.user.save();
        }
        res.status(200).json({ success: true, message: "Welcome back!", user: req.user, sessionId: req.sessionID });
    } catch (e) {
        res.status(200).json({ success: true, message: "Welcome back!", user: req.user, sessionId: req.sessionID });
    }
};

module.exports.getCurrentUser = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const user = await User.findById(req.user._id).populate('wishlist', '_id');
            const validWishlistIds = user.wishlist.filter(p => p !== null).map(p => p._id);
            if (validWishlistIds.length !== req.user.wishlist.length) {
                req.user.wishlist = validWishlistIds;
                await req.user.save();
            }
            res.status(200).json({ success: true, user: req.user });
        } catch (e) {
            res.status(200).json({ success: true, user: req.user });
        }
    } else {
        res.status(401).json({ success: false, message: "Not authenticated" });
    }
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.status(200).json({ success: true, message: "Logged out successfully" });
    });
};

module.exports.oauthCallback = (req, res) => {
    // Successful authentication, redirect to frontend.
    const redirectUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(redirectUrl);
};

const crypto = require("crypto");
const nodemailer = require("nodemailer");

module.exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "No account with that email address exists." });
        }

        const token = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Nodemailer setup
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER || 'mock@gmail.com',
                pass: process.env.EMAIL_PASS || 'mockpassword'
            }
        });

        const mailOptions = {
            to: user.email,
            from: 'noreply@glowspark.com',
            subject: 'Glow Spark Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://localhost:5173/reset-password/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        // If no real email is set up, just log it instead of throwing error.
        if (process.env.EMAIL_USER) {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ success: true, message: `An e-mail has been sent to ${user.email} with further instructions.` });
        } else {
            console.log("Mock Email Sent: ", mailOptions.text);
            res.status(200).json({ success: true, message: `Mock email sent to ${user.email} (check backend console).` });
        }

    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

module.exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        
        if (!user) {
            return res.status(400).json({ success: false, message: "Password reset token is invalid or has expired." });
        }

        await user.setPassword(newPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Success! Your password has been changed." });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
