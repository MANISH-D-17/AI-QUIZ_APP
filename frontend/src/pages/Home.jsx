import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Flame, 
  BarChart3, 
  Percent, 
  Clock, 
  Zap, 
  Trophy, 
  BookOpen, 
  Calendar,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { getProfile } from '../services/storage';
import { getQuizzes, getResults } from '../services/api';
import QuizCard from '../components/quiz/QuizCard';
import SmartSearch from '../components/ai/SmartSearch';
import Badge from '../components/common/Badge';
import toast from 'react-hot-toast';

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: 'Alex' });
  const [stats, setStats] = useState({ totalTaken: 0, avgScore: 0, totalTime: 0, currentStreak: 4 });
  const [attempts, setAttempts] = useState([]);
  const [recommendedQuizzes, setRecommendedQuizzes] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Load profile from local storage configuration
        const userProfile = getProfile() || { name: 'Alex' };
        setProfile(userProfile);

        // Fetch dynamic attempts and quizzes from the Express/MongoDB APIs
        const quizzesRes = await getQuizzes();
        const attemptsRes = await getResults();

        const mergedQuizzes = quizzesRes.data || [];
        const userAttempts = attemptsRes.data || [];

        setAllQuizzes(mergedQuizzes);
        setAttempts(userAttempts.slice(0, 5)); // Show last 5 attempts

        // Dynamically compute user statistics from database records
        const totalTaken = userAttempts.length;
        const sumScores = userAttempts.reduce((acc, curr) => acc + curr.score, 0);
        const avgScore = totalTaken > 0 ? Math.round(sumScores / totalTaken) : 0;
        const totalTime = userAttempts.reduce((acc, curr) => acc + curr.timeTaken, 0);

        // Dynamic Streak calculation from attempts list dates
        let currentStreak = 0;
        if (userAttempts.length > 0) {
          const uniqueDates = [...new Set(userAttempts.map(att => att.date))].sort().reverse();
          const todayStr = new Date().toISOString().split('T')[0];
          
          if (uniqueDates[0] === todayStr) {
            currentStreak = 1;
            let currentDay = new Date();
            for (let i = 1; i < uniqueDates.length; i++) {
              currentDay.setDate(currentDay.getDate() - 1);
              const dayStr = currentDay.toISOString().split('T')[0];
              if (uniqueDates[i] === dayStr) {
                currentStreak++;
              } else {
                break;
              }
            }
          } else {
            // Check if streak was broken today but maintained yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (uniqueDates[0] === yesterdayStr) {
              currentStreak = 1;
              let currentDay = yesterday;
              for (let i = 1; i < uniqueDates.length; i++) {
                currentDay.setDate(currentDay.getDate() - 1);
                const dayStr = currentDay.toISOString().split('T')[0];
                if (uniqueDates[i] === dayStr) {
                  currentStreak++;
                } else {
                  break;
                }
              }
            }
          }
        }
        
        setStats({
          totalTaken,
          avgScore,
          totalTime,
          currentStreak: currentStreak || 0
        });

        // AI Recommendation Logic (Weak Topics / Gap Analysis)
        const categoryScores = {};
        const categoryCounts = {};

        userAttempts.forEach(att => {
          const cat = att.category;
          if (cat) {
            if (!categoryScores[cat]) {
              categoryScores[cat] = 0;
              categoryCounts[cat] = 0;
            }
            categoryScores[cat] += att.score;
            categoryCounts[cat] += 1;
          }
        });

        let weakCategory = null;
        let lowestAvg = 100;

        Object.keys(categoryScores).forEach(cat => {
          const avg = categoryScores[cat] / categoryCounts[cat];
          if (avg < lowestAvg) {
            lowestAvg = avg;
            weakCategory = cat;
          }
        });

        let recommendations = [];
        if (weakCategory) {
          recommendations = mergedQuizzes.filter(q => q.category === weakCategory && !userAttempts.some(att => att.quizId === q.id));
        }

        if (recommendations.length < 3) {
          const untaken = mergedQuizzes.filter(q => !userAttempts.some(att => att.quizId === q.id) && !recommendations.some(req => req.id === q.id));
          recommendations = [...recommendations, ...untaken];
        }

        setRecommendedQuizzes(recommendations.slice(0, 3));
      } catch (err) {
        console.error("Dashboard failed to load database records:", err);
        toast.error("Failed to connect to backend server. Using mock caching fallback.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalHours = stats && stats.totalTime !== undefined ? (stats.totalTime / 3600).toFixed(1) : '0.0';

  const handleAcceptChallenge = () => {
    navigate('/quiz/world-war-ii');
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text">
        <div className="animate-pulse font-headings font-bold text-lg text-primary">
          ✦ Synching dashboard records from MongoDB...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-page">
      {/* 1. Header & AI Smart Search Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{todayStr}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-headings font-bold text-text tracking-tight">
            Welcome back, {profile.name} 👋
          </h1>
        </div>
        <div className="w-full md:max-w-md">
          <SmartSearch quizzes={allQuizzes} />
        </div>
      </div>

      {/* 2. Hero Daily Challenge Section */}
      <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl transition-all duration-300 hover:border-accent/20 group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all duration-500" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center space-x-2">
              <Badge type="ai" value="✦ Daily Challenge" />
              <div className="bg-amber-500/10 text-secondary border border-amber-500/20 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                <Zap className="h-3 w-3 mr-1 fill-secondary text-secondary" />
                <span>Double XP</span>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-headings font-bold text-text leading-tight">
              World War II Strategic Review
            </h2>
            <p className="text-sm md:text-base text-text-muted leading-relaxed">
              Test your understanding of World War II military tactics, leadership figures, and major global campaigns. Earn double history masterpoints and keep your streak hot!
            </p>
            <div className="flex items-center space-x-4 text-xs font-semibold text-text-muted">
              <span>Category: <strong className="text-text">History</strong></span>
              <span>•</span>
              <span>Estimated Time: <strong className="text-text">15 Mins</strong></span>
              <span>•</span>
              <span>10 Questions</span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={handleAcceptChallenge}
              className="w-full sm:w-auto relative group overflow-hidden bg-gradient-to-r from-primary to-emerald-600 text-white font-extrabold px-8 py-4 rounded-xl shadow-lg hover:shadow-primary/30 active:scale-95 transition-all duration-300 border border-primary/40 animate-pulse-warning"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <span>Accept Challenge</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-lg flex items-center space-x-4 hover:border-border-2 transition-all">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-primary border border-emerald-500/15">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-text">{stats.totalTaken}</h4>
            <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Quizzes Taken</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-lg flex items-center space-x-4 hover:border-border-2 transition-all">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/15">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-text">{stats.avgScore}%</h4>
            <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Average Score</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-lg flex items-center space-x-4 hover:border-border-2 transition-all">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/15">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-text">{totalHours} hrs</h4>
            <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Duration Spent</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-lg flex items-center space-x-4 hover:border-border-2 transition-all">
          <div className="p-3 bg-amber-500/10 rounded-xl text-secondary border border-amber-500/15">
            <Flame className="h-6 w-6 fill-secondary" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-text">{stats.currentStreak} days</h4>
            <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Current Streak</span>
          </div>
        </div>
      </div>

      {/* 4. AI Picks / Recommended For You */}
      {recommendedQuizzes.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl md:text-2xl font-headings font-bold text-text">
              Recommended For You
            </h3>
            <Badge type="ai" value="✦ AI Picks" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </div>
      )}

      {/* 5. Available Quizzes Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl md:text-2xl font-headings font-bold text-text">
            Explore All Quizzes
          </h3>
          <Link
            to="/quizzes"
            className="text-primary hover:text-emerald-300 font-bold text-sm flex items-center space-x-1 group"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allQuizzes.slice(0, 6).map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      </div>

      {/* 6. Recent Attempts Table */}
      {attempts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-headings font-bold text-text">
            Recent Activity
          </h3>
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/80 text-[10px] text-text-muted font-bold tracking-wider uppercase bg-surface-2/10">
                    <th className="py-4 px-6">Quiz Name</th>
                    <th className="py-4 px-6 text-center">Score Grade</th>
                    <th className="py-4 px-6 text-center">Time Spent</th>
                    <th className="py-4 px-6">Attempt Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {attempts.map((att) => {
                    let scoreColor = 'text-primary bg-primary/10 border-primary/20';
                    if (att.score < 50) {
                      scoreColor = 'text-danger bg-danger/10 border-danger/20';
                    } else if (att.score < 80) {
                      scoreColor = 'text-secondary bg-amber-500/10 border-amber-500/20';
                    }

                    const formatMinSec = (secs) => {
                      const m = Math.floor(secs / 60);
                      const s = secs % 60;
                      return `${m}m ${s}s`;
                    };

                    return (
                      <tr key={att._id || att.id} className="hover:bg-surface-2/20 transition-colors">
                        <td className="py-4 px-6 font-bold text-text">{att.quizTitle}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full border ${scoreColor}`}>
                            {att.score}%
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center text-text-muted font-mono">{formatMinSec(att.timeTaken)}</td>
                        <td className="py-4 px-6 text-text-muted">{att.date}</td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            to={`/quiz/${att.quizId}`}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-primary hover:text-emerald-300 transition-colors"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Retake</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
