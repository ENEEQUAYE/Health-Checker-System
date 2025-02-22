require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
// const socketIo = require("socket.io");
const http = require("http");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const conditionRoutes = require("./routes/conditionRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const server = http.createServer(app);
// const io = socketIo(server);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/conditions", conditionRoutes);
app.use("/api/users", userRoutes);

// WebSocket for Chatbot
// const OpenAI = require("openai");
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// io.on("connection", socket => {
//     console.log("User connected");

//     socket.on("message", async data => {
//         try {
//             const response = await openai.chat.completions.create({
//                 model: "gpt-4",
//                 messages: [{ role: "system", content: "You are a health symptom checker." }, { role: "user", content: data.message }],
//             });

//             const reply = response.choices[0].message.content;
//             socket.emit("response", { message: reply });
//         } catch (error) {
//             socket.emit("response", { message: "Error processing your request." });
//         }
//     });

//     socket.on("disconnect", () => console.log("User disconnected"));
// });

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
