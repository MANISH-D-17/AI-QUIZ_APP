const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  id: { type: String },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index of correct option (0, 1, 2...)
  explanation: { type: String },
  topic: { type: String },
  imageUrl: { type: String, default: null }
});

const quizSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Used for URL lookup e.g., 'python-basics'
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  duration: { type: Number, default: 600 }, // Duration in seconds
  questionsCount: { type: Number },
  rating: { type: Number, default: 5.0 },
  takenCount: { type: Number, default: 0 },
  questions: [questionSchema]
}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);