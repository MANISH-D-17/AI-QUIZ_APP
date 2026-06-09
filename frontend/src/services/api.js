const API_BASE = import.meta.env.VITE_API_URL || "/api";

// Helper for standard HTTP request wrapper
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      },
      ...options
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `API request failed with status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error(`API Error on ${url}:`, error.message);
    throw error;
  }
};

// GET all quizzes
export const getQuizzes = async (category = "", difficulty = "") => {
  let url = `${API_BASE}/quiz`;
  const params = [];
  if (category) params.push(`category=${encodeURIComponent(category)}`);
  if (difficulty) params.push(`difficulty=${encodeURIComponent(difficulty)}`);
  if (params.length > 0) url += `?${params.join("&")}`;
  
  return apiRequest(url);
};

// GET single quiz details by ID
export const getQuizById = async (id) => {
  return apiRequest(`${API_BASE}/quiz/${id}`);
};

// POST submit a completed quiz attempt result
export const submitQuiz = async (attemptData) => {
  return apiRequest(`${API_BASE}/result`, {
    method: "POST",
    body: JSON.stringify(attemptData)
  });
};

// GET results history attempts
export const getResults = async () => {
  return apiRequest(`${API_BASE}/result`);
};

// GET dynamic aggregated analytics statistics
export const getAnalytics = async () => {
  return apiRequest(`${API_BASE}/result/analytics`);
};

// GET a specific result attempt by ID
export const getResultById = async (id) => {
  return apiRequest(`${API_BASE}/result/${id}`);
};

// GET ranked competitive leaderboard rankings
export const getLeaderboard = async (quizId = "all") => {
  return apiRequest(`${API_BASE}/result/leaderboard?quizId=${encodeURIComponent(quizId)}`);
};

// POST generate custom quiz via AI generator
export const generateAIQuiz = async (topic, difficulty, count) => {
  return apiRequest(`${API_BASE}/ai/generate`, {
    method: "POST",
    body: JSON.stringify({ topic, difficulty, count })
  });
};
