const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS with environment configurations
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
  origin: [frontendUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quiz-platform");
    console.log(`MongoDB Connected successfully to host: ${conn.connection.host} 🔥`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message} ❌`);
    process.exit(1);
  }
};

// Mount route modules
const quizRoutes = require("./routes/quizRoutes");
const resultRoutes = require("./routes/resultRoutes");
const aiRoutes = require("./routes/aiRoutes");

app.use("/api/quiz", quizRoutes);
app.use("/api/quizzes", quizRoutes); // Plural compatibility alias
app.use("/api/result", resultRoutes);
app.use("/api/results", resultRoutes); // Plural compatibility alias
app.use("/api/ai", aiRoutes);

// Base server endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI-Powered Quiz Platform REST API Backend Running Bro 🚀"
  });
});

// Centralized 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Requested endpoint not found"
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("Centralized Error Catch: ", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected system error occurred",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// Startup wrapper
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server successfully started in ${process.env.NODE_ENV} mode on port ${PORT} 🚀`);
  });
};

startServer();