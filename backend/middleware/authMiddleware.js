const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticate = async (req, res, next) => {
    const token = req.header("Authorization");
    
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select("-password"); // Exclude password
        if (!req.user) return res.status(401).json({ message: "User not found." });

        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token." });
    }
};
