const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Quiz = require("../models/Quiz");

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quiz-platform";

mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB Connected for Seeding... 🧬"))
  .catch((err) => {
    console.error("MongoDB Connection Error in Seeding: ", err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    // Read the premium core quizzes JSON copied into backend
    const jsonPath = path.join(__dirname, "quizzes.json");
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Seeding file quizzes.json not found at ${jsonPath}`);
    }

    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const quizzes = JSON.parse(rawData);

    // Wipe any existing quizzes in collection
    await Quiz.deleteMany();
    console.log("Existing Quiz database collection cleared successfully. 🧹");

    // Insert loaded premium quizzes
    const inserted = await Quiz.insertMany(quizzes);
    console.log(`Successfully seeded ${inserted.length} premium quizzes into MongoDB! 🧬🔥`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding operation failed: ", error);
    process.exit(1);
  }
};

seedData();