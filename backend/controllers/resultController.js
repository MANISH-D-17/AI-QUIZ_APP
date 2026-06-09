const Result = require("../models/Result");

// POST save a quiz attempt result
exports.saveResult = async (req, res, next) => {
  try {
    const {
      userName,
      quizId,
      quizTitle,
      score,
      totalQuestions,
      correctCount,
      timeTaken,
      category,
      answers,
      analytics
    } = req.body;

    const result = new Result({
      userName: userName || "Alex",
      quizId,
      quizTitle,
      score,
      totalQuestions,
      correctCount,
      timeTaken,
      category,
      answers,
      analytics
    });

    const savedResult = await result.save();

    res.status(201).json({
      success: true,
      message: "Quiz attempt result saved successfully",
      data: savedResult
    });
  } catch (error) {
    next(error);
  }
};

// GET all attempts history
exports.getResults = async (req, res, next) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Results history retrieved successfully",
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// GET a specific result attempt by ID
exports.getResultById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let result = null;

    // Check if valid ObjectId, lookup in MongoDB
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      result = await Result.findById(id);
    } else {
      // In case we're matching string custom mock IDs
      result = await Result.findOne({ quizId: id });
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Attempt result not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Attempt details retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// GET global high-score rankings leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { quizId } = req.query;
    const filter = {};
    if (quizId && quizId !== 'all') {
      filter.quizId = quizId;
    }

    // Get all results, sort by score descending, then by timeTaken ascending
    const results = await Result.find(filter)
      .sort({ score: -1, timeTaken: 1 });

    res.status(200).json({
      success: true,
      message: "Leaderboard loaded successfully",
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// GET dynamically aggregated analytics from MongoDB attempts
exports.getAnalytics = async (req, res, next) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });

    const totalQuizzes = results.length;
    let averageScore = 0;
    let bestScore = 0;
    let worstScore = 0;
    let totalTime = 0;

    if (totalQuizzes > 0) {
      const sumScores = results.reduce((acc, curr) => acc + curr.score, 0);
      averageScore = Math.round(sumScores / totalQuizzes);
      bestScore = Math.max(...results.map(r => r.score));
      worstScore = Math.min(...results.map(r => r.score));
      totalTime = results.reduce((acc, curr) => acc + curr.timeTaken, 0);
    }

    // Category breakdown
    const categoryScores = {};
    results.forEach(r => {
      const cat = r.category;
      if (!categoryScores[cat]) {
        categoryScores[cat] = { sum: 0, count: 0 };
      }
      categoryScores[cat].sum += r.score;
      categoryScores[cat].count += 1;
    });

    const categoryPerformance = Object.keys(categoryScores).map(cat => ({
      category: cat,
      avgScore: Math.round(categoryScores[cat].sum / categoryScores[cat].count),
      count: categoryScores[cat].count
    }));

    res.status(200).json({
      success: true,
      message: "Analytics compiled successfully from MongoDB",
      data: {
        totalQuizzes,
        averageScore,
        bestScore,
        worstScore,
        totalTime,
        categoryPerformance,
        history: results
      }
    });
  } catch (error) {
    next(error);
  }
};