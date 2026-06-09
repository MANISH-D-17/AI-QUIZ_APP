# SmartPrep - Full-Stack AI-Powered Quiz & Analytics Platform

SmartPrep is a state-of-the-art full-stack learning platform. It compiles custom exam-preparation quizzes using a built-in AI Custom Quiz Compiler, gauges concepts mastery via dynamic subject indices, tracks streaks and badges, and registers complete analytical diagnostics over MongoDB.

---

## 🚀 Features Checklist

- [x] **Curated Premium Quizzes**: Seeding scripts to load comprehensive core courses (Python, WWII, Algebra, Advanced JS, Biology) directly inside MongoDB.
- [x] **AI Custom Quiz Compiler**: Instantly compiles custom takeable quizzes based on user parameters, automatically persisting them in MongoDB.
- [x] **Real-Time Interactive Taker**: Timer countdowns, flagged ledger palettes, question palettes, and responsive review sheets.
- [x] **Aggregated Analytics & Progress Trends**: Recharts progression grids showing accuracy over time, diagnostic gap analysis, and badge rewards logs.
- [x] **Global competitive Leaderboards**: Ranks solving speeds and scores calculated over MongoDB records.

---

## 📁 System Architecture

```txt
project-root/
│
├── backend/                  # REST Express Server & MongoDB Schemas
│   ├── config/
│   ├── controllers/          # Business logic controllers
│   ├── data/                 # Premium seed files & DB seeder
│   ├── models/               # Mongoose DB schemas (Quiz, Result)
│   ├── routes/               # Express endpoints routers
│   ├── server.js             # CORS, parsers, and errors middleware
│   └── .env                  # Environmental configurations
│
├── frontend/                 # Vite + React 18 SPA User Interface
│   ├── src/
│   │   ├── services/
│   │   │   ├── api.js        # Centralized REST fetch consumer
│   │   │   └── storage.js    # Synchronized local badges/profile helper
│   │   └── pages/            # Beautiful dashboard, profile, and rankings pages
│   └── vite.config.js        # Redirection proxy resolver
│
├── package.json              # Orchestrates concurrent execution
└── README.md                 # System operational guide
```

---

## 🛠️ Installation & Setup

Ensure you have **Node.js** and **MongoDB** installed. The MongoDB community server has already been successfully installed and launched on your macOS system via Homebrew!

### 1. Install Dependencies

In the root workspace, run the following automated utility command to install packages in the root, client, and server folders concurrently:

```bash
npm run install-all
```

### 2. Configure Environment Variables

Create `backend/.env` containing the following values (already prepared for your local environment):

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/quiz-platform
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Seed Premium Quizzes

Populate MongoDB with the premium courses:

```bash
node backend/data/seed.js
```

---

## 🎮 Running the Application

To launch both the REST API server and the Vite React app concurrently in development mode, run:

```bash
npm run dev
```

The application will be accessible at:
- **Frontend SPA Client**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:5001](http://localhost:5001)

---

## 📡 REST API Specifications

| Method | Endpoint | Payload | Description |
|---|---|---|---|
| **GET** | `/api/quiz` | None | Fetches all core and custom quizzes |
| **GET** | `/api/quiz/:id` | None | Fetches questions and details for a quiz |
| **POST** | `/api/result` | `{ quizId, score, correctCount, timeTaken, answers, analytics }` | Submits attempt results |
| **GET** | `/api/result/analytics` | None | Compiles historical stats cards and charts trends |
| **GET** | `/api/result/leaderboard` | `?quizId=all` | Compiles competitive ranking boards |
| **POST** | `/api/ai/generate` | `{ topic, difficulty, count }` | Compiles AI custom quiz |
