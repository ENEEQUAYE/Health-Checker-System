const express = require("express");
const Condition = require("../models/Condition");
const axios = require("axios");
const { authenticate } = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// Get All Symptoms
router.get("/symptoms", async (req, res) => {
    try {
        const conditions = await Condition.find();
        const allSymptoms = new Set();
        conditions.forEach(cond => cond.symptoms.forEach(symptom => allSymptoms.add(symptom)));

        res.json({ symptoms: Array.from(allSymptoms) });
    } catch (error) {
        res.status(500).json({ message: "Error fetching symptoms", error: error.message });
    }
});


// Symptom Checker - Connects to Flask API and logs to DB
router.post("/check", authenticate, async (req, res) => {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.length === 0) {
        return res.status(400).json({ message: "No symptoms provided." });
    }

    try {
        // Send symptoms to Flask API
        const flaskResponse = await axios.post("http://localhost:5001/analyze", { symptoms });

        // Extract diagnosis from Flask response
        const diagnosis = flaskResponse.data;

        // Log the symptom check into user's medical history
        const user = await User.findById(req.user.id);
        user.medicalHistory.push({
            date: new Date(),
            symptoms: symptoms.map(s => s.name),
            diagnosis: diagnosis.length > 0 ? diagnosis[0].condition : "Unknown"
        });
        await user.save();

        // Send diagnosis back to the frontend
        res.json(diagnosis);
    } catch (error) {
        console.error("Error connecting to Flask API or saving history:", error.message);
        res.status(500).json({ message: "Error analyzing symptoms. Please try again." });
    }
});

// Get User's Medical History
router.get("/history", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("username medicalHistory");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({
            username: user.username,
            medicalHistory: user.medicalHistory
        });
    } catch (error) {
        console.error("Error fetching medical history:", error.message);
        res.status(500).json({ message: "Error retrieving medical history." });
    }
});


module.exports = router;
