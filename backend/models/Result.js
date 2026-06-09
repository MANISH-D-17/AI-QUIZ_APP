const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  userName: { type: String, default: "Alex" },
  quizId: { type: String, required: true },
  quizTitle: { type: String, required: true },
  score: { type: Number, required: true }, // Percentage score (0-100)
  totalQuestions: { type: Number, required: true },
  correctCount: { type: Number, required: true },
  timeTaken: { type: Number, required: true }, // in seconds
  category: { type: String, required: true },
  answers: { type: mongoose.Schema.Types.Mixed }, // Map of question index -> selected option index
  analytics: { type: mongoose.Schema.Types.Mixed }, // Enhanced performance analytics tracking module data
  date: { type: String, default: () => new Date().toISOString().split("T")[0] }
}, { timestamps: true });

module.exports = mongoose.model("Result", resultSchema);