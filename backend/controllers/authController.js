const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid email or password." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password." });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.registerUser = async (req, res) => {
    try {
        const { username, email, password, phone } = req.body;

        // Validate inputs
        if (!username || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if email or username already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already taken." });
        }

        // Create new user
        const newUser = new User({ username, email, password, phone });
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ token, user: { id: newUser._id, username, email } });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required." });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found." });

        // Generate reset token (valid for 1 hour)
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Send Email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
        });

        const resetUrl = `http://localhost:5500/frontend/html/reset_password_confirm.html?token=${token}`;
        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: user.email,
            subject: "Reset Your Password",
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
        });

        res.json({ message: "Reset link sent to email." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Step 2: Reset Password with Token
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) return res.status(400).json({ message: "Password is required." });

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(400).json({ message: "Invalid token or user not found." });

        // Hash new password
        user.password = await bcrypt.hash(password, 10);
        await user.save();

        res.json({ message: "Password reset successfully. You can now log in." });
    } catch (error) {
        res.status(500).json({ message: "Invalid or expired token.", error: error.message });
    }
};