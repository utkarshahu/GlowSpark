const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const authController = require("../controllers/auth.js");
const { validateSignup, validateLogin } = require("../middleware.js");

router.post("/signup", validateSignup, wrapAsync(authController.signup));

router.post("/login", 
    validateLogin,
    passport.authenticate("local", { failureMessage: true }), 
    authController.login
);

router.get("/me", authController.getCurrentUser);

router.post("/logout", authController.logout);

// OAuth Routes
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${frontendUrl}/login` }), authController.oauthCallback);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: `${frontendUrl}/login` }), authController.oauthCallback);

// OTP & Password Reset
router.post("/forgot-password", wrapAsync(authController.forgotPassword));
router.post("/reset-password", wrapAsync(authController.resetPassword));

module.exports = router;
