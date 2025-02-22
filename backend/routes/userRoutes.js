const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Get Logged-in User Data
router.get("/dashboard", authenticate, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
