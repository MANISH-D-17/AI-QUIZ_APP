const express = require("express");
const router = express.Router();
const {
  saveResult,
  getResults,
  getAnalytics,
  getResultById,
  getLeaderboard
} = require("../controllers/resultController");
const { protect } = require("../middleware/authMiddleware");

// Protected Results routes
router.route("/").post(protect, saveResult).get(protect, getResults);
router.route("/analytics").get(protect, getAnalytics);
router.route("/leaderboard").get(getLeaderboard);
router.route("/:id").get(protect, getResultById);

module.exports = router;