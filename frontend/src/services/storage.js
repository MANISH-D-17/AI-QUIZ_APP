// LocalStorage Helpers for Quiz Platform Persistence

const KEYS = {
  ATTEMPTS: 'quiz_attempts_v1',
  CUSTOM_QUIZZES: 'quiz_custom_quizzes_v1',
  STATS: 'quiz_user_stats_v1',
  PROFILE: 'quiz_user_profile_v1'
};

const DEFAULT_PROFILE = {
  name: 'Alex',
  joinedDate: 'May 2026',
  avatarInitials: 'AL',
  unlockedBadges: ['AI Explorer 🤖', 'Marathoner 🏃'],
  lockedBadges: ['Speedster ⚡', 'Perfect Score 🏆']
};

const DEFAULT_STATS = {
  totalTaken: 0,
  avgScore: 0,
  totalTime: 0,
  currentStreak: 0,
  lastQuizDate: null
};

const DEFAULT_ATTEMPTS = [];

// Initialize Storage Helper
function getJson(key, defaultValue) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
    return defaultValue;
  }
}

function setJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage`, e);
  }
}

export function getAttempts() {
  const attempts = localStorage.getItem(KEYS.ATTEMPTS);
  if (!attempts) {
    setJson(KEYS.ATTEMPTS, DEFAULT_ATTEMPTS);
    return DEFAULT_ATTEMPTS;
  }
  return JSON.parse(attempts);
}

export function saveAttempt(attempt) {
  const attempts = getAttempts();
  const newAttempts = [attempt, ...attempts];
  setJson(KEYS.ATTEMPTS, newAttempts);

  // Update Stats Automatically
  updateStatsOnNewAttempt(attempt);
}

export function getCustomQuizzes() {
  return getJson(KEYS.CUSTOM_QUIZZES, []);
}

export function saveCustomQuiz(quiz) {
  const customQuizzes = getCustomQuizzes();
  // Avoid duplicate saves
  if (!customQuizzes.some(q => q.id === quiz.id)) {
    setJson(KEYS.CUSTOM_QUIZZES, [quiz, ...customQuizzes]);
  }
}

export function getStats() {
  const stats = localStorage.getItem(KEYS.STATS);
  if (!stats) {
    setJson(KEYS.STATS, DEFAULT_STATS);
    return DEFAULT_STATS;
  }
  return JSON.parse(stats);
}

export function saveStats(stats) {
  setJson(KEYS.STATS, stats);
}

export function getProfile() {
  const profile = localStorage.getItem('profile');
  if (!profile) {
    // If no real profile exists, fallback to empty/defaults, but keep the name blank so they are forced to login or it shows User
    return {
      name: 'User',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      avatarInitials: 'U',
      unlockedBadges: [],
      lockedBadges: ['Speedster ⚡', 'Perfect Score 🏆', 'AI Explorer 🤖', 'Marathoner 🏃']
    };
  }
  
  const parsed = JSON.parse(profile);
  // Add some defaults for missing badge arrays if they aren't saved in localStorage
  if (!parsed.unlockedBadges) parsed.unlockedBadges = [];
  if (!parsed.lockedBadges) parsed.lockedBadges = ['Speedster ⚡', 'Perfect Score 🏆', 'AI Explorer 🤖', 'Marathoner 🏃'];
  
  return parsed;
}

export function saveProfile(profile) {
  localStorage.setItem('profile', JSON.stringify(profile));
}

function updateStatsOnNewAttempt(attempt) {
  const stats = getStats();
  const attempts = getAttempts();
  
  const totalTaken = attempts.length;
  const sumScores = attempts.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = Math.round(sumScores / totalTaken);
  const totalTime = stats.totalTime + attempt.timeSpent;

  // Streak logic
  const today = new Date().toISOString().split('T')[0];
  let currentStreak = stats.currentStreak;
  const lastDate = stats.lastQuizDate;

  if (lastDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      currentStreak += 1;
    } else if (lastDate !== today) {
      // Streak broke or maintained
      currentStreak = 1;
    }
  } else {
    currentStreak = 1;
  }

  const updatedStats = {
    totalTaken,
    avgScore,
    totalTime,
    currentStreak,
    lastQuizDate: today
  };

  saveStats(updatedStats);

  // Dynamic Badge Unlocking
  updateBadges(attempt, attempts);
}

function updateBadges(newAttempt, allAttempts) {
  const profile = getProfile();
  const newlyUnlocked = [];

  // 1. Speedster: finished in < 2 minutes (120s) and score >= 80%
  if (newAttempt.timeSpent < 120 && newAttempt.score >= 80) {
    newlyUnlocked.push("Speedster ⚡");
  }

  // 2. Perfect Score: 100% score
  if (newAttempt.score === 100) {
    newlyUnlocked.push("Perfect Score 🏆");
  }

  // 3. Marathoner: 10+ quizzes taken
  if (allAttempts.length >= 10) {
    newlyUnlocked.push("Marathoner 🏃");
  }

  // 4. AI Explorer: taken a custom quiz
  if (newAttempt.quizId.startsWith('custom-ai-')) {
    newlyUnlocked.push("AI Explorer 🤖");
  }

  if (newlyUnlocked.length > 0) {
    const unlockedSet = new Set([...profile.unlockedBadges, ...newlyUnlocked]);
    const lockedFiltered = profile.lockedBadges.filter(b => !unlockedSet.has(b));
    
    saveProfile({
      ...profile,
      unlockedBadges: Array.from(unlockedSet),
      lockedBadges: lockedFiltered
    });
  }
}
