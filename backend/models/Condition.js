const mongoose = require("mongoose");

const ConditionSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },  // Condition name
    symptoms: { type: [String], required: true },          // Array of symptoms
    advice: { type: String, required: true }               // Medical advice
}, { timestamps: true });                                   // Auto-track created/updated times

module.exports = mongoose.model("Condition", ConditionSchema);
