const express = require("express");

const router = express.Router();

const { generateQuiz } = require("../controllers/aiController");

router.post("/generate", generateQuiz);

module.exports = router;