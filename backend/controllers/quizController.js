const Quiz = require("../models/Quiz");

// GET all quizzes with optional filter queries
exports.getAllQuizzes = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }

    const quizzes = await Quiz.find(filter);

    res.status(200).json({
      success: true,
      message: "Quizzes fetched successfully",
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

// GET a specific quiz by custom identifier or database ID
exports.getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Attempt custom id string lookup first (e.g. 'python-basics')
    let quiz = await Quiz.findOne({ id });

    // Fallback to Mongoose native ObjectId lookup
    if (!quiz && id.match(/^[0-9a-fA-F]{24}$/)) {
      quiz = await Quiz.findById(id);
    }

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Quiz details retrieved successfully",
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// POST create quiz (optional API requirement support)
exports.createQuiz = async (req, res, next) => {
  try {
    const newQuiz = new Quiz(req.body);
    const saved = await newQuiz.save();
    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: saved
    });
  } catch (error) {
    next(error);
  }
};