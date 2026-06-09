const express = require("express");
const router = express.Router();

const {
  saveResult,
  getResults,
  getLeaderboard,
  getAnalytics,
  getResultById
} = require("../controllers/resultController");

router.post("/", saveResult);
router.get("/", getResults);
router.get("/analytics", getAnalytics);
router.get("/leaderboard", getLeaderboard);
router.get("/:id", getResultById);

module.exports = router;