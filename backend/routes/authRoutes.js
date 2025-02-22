const express = require("express");
const { registerUser, loginUser, requestPasswordReset, resetPassword  } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser); // Registration route
router.post("/login", loginUser);       // Login route (already added)
router.post("/reset-password", requestPasswordReset);  // Step 1: Request reset
router.post("/reset-password/:token", resetPassword);  // Step 2: Reset password

module.exports = router;
