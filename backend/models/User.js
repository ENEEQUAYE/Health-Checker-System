const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const SymptomLogSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    symptoms: [String],
    diagnosis: String
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    medicalHistory: [SymptomLogSchema]  // Log for symptom checks
}, { timestamps: true });

// Hash password before saving user
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare hashed password
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
