import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Percent, 
  Clock, 
  Award, 
  TrendingUp, 
  ChevronRight, 
  Flame, 
  BookOpen,
  Trophy,
  LineChart as LineIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import toast from 'react-hot-toast';
import { getAnalytics } from '../services/api';
import { formatTime } from '../utils/validation';

export default function Analytics() {
  const [data, setData] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    worstScore: 0,
    totalTime: 0,
    categoryPerformance: [],
    history: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await getAnalytics();
        if (response && response.success && response.data) {
          setData(response.data);
        } else {
          toast.error("Failed to load analytics payload");
        }
      } catch (err) {
        console.error("Failed to retrieve analytics stats:", err);
        toast.error("Database connection failed. Unable to fetch analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text">
        <div className="animate-pulse text-primary font-bold text-lg">
          ✦ Compiling statistics from MongoDB...
        </div>
      </div>
    );
  }

  // Format Recharts data (reverse chronological history to show progression)
  const chartData = [...data.history]
    .reverse()
    .map((item, idx) => ({
      name: `Quiz ${idx + 1}`,
      score: item.score,
      title: item.quizTitle
    }));

  const badges = [];
  if (data.totalQuizzes >= 1) badges.push({ emoji: "🏅", name: "Novice Player", desc: "Completed your first quiz attempt." });
  if (data.bestScore === 100) badges.push({ emoji: "🎯", name: "Perfect Score", desc: "Scored 100% accuracy on a quiz." });
  if (data.totalQuizzes >= 3) badges.push({ emoji: "⚡", name: "Consistent Player", desc: "Finished over 3 dynamic evaluations." });
  if (data.totalQuizzes >= 10) badges.push({ emoji: "🏃", name: "Marathoner", desc: "Finished over 10 learning modules." });

  return (
    <div className="space-y-10 animate-page pb-12">
      {/* 1. Header Title */}
      <div className="pb-4 border-b border-border/40">
        <h1 className="text-3xl font-headings font-bold text-text tracking-tight flex items-center">
          <BarChart3 className="h-8 w-8 text-primary mr-3" />
          Analytics Dashboard
        </h1>
        <p className="text-sm text-text-muted">
          Analyze your historical score trends, weak categories, and time allocations dynamically compiled from MongoDB.
        </p>
      </div>

      {/* 2. Basic Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Taken */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-primary border border-emerald-500/15">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-text">{data.totalQuizzes}</h4>
            <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Total Quizzes</span>
          </div>
        </div>

        {/* Avg Score */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/15">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-text">{data.averageScore}%</h4>
            <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Average Score</span>
          </div>
        </div>

        {/* Best Score */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-secondary border border-amber-500/15">
            <Trophy className="h-6 w-6 fill-secondary" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-text">{data.bestScore}%</h4>
            <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Best Score</span>
          </div>
        </div>

        {/* Lowest Score */}
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-rose-500/10 rounded-xl text-danger border border-rose-500/15">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-text">{data.worstScore}%</h4>
            <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Lowest Score</span>
          </div>
        </div>
      </div>

      {/* 3. Recharts Score Progression Curve */}
      {chartData.length > 0 ? (
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <h3 className="text-lg font-headings font-bold text-text tracking-wider uppercase mb-6 flex items-center">
            <LineIcon className="h-5 w-5 text-accent mr-2" />
            Accuracy Progression Trend
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" domain={[0, 100]} fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#F1F5F9', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center text-sm text-text-muted">
          Take a quiz to unlock your historical progression chart!
        </div>
      )}

      {/* 4. Quiz Progress Cards & Badges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Attempt Progress Bars */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-headings font-bold text-text tracking-wider uppercase pb-3 border-b border-border/40">
            Attempts Performance
          </h3>
          {data.history.length > 0 ? (
            <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
              {data.history.map((item, index) => (
                <div 
                  key={item._id || item.id} 
                  className="bg-surface-2/20 border border-border/60 p-4 rounded-xl space-y-3 border-l-4 border-l-primary hover:border-border transition-colors"
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-text truncate max-w-[200px]">{item.quizTitle}</span>
                    <span className="text-primary font-bold font-mono">{item.score}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-text-muted font-bold">
                    <span>Speed: {formatTime(item.timeTaken)}</span>
                    <span>Date: {item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-sm text-text-muted">
              No historical attempts completed.
            </div>
          )}
        </div>

        {/* Right: Badges Earned */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-headings font-bold text-text tracking-wider uppercase pb-3 border-b border-border/40 flex items-center">
            <Award className="h-5 w-5 text-primary mr-2" />
            Badges Earned
          </h3>
          {badges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge, idx) => (
                <div 
                  key={idx}
                  className="bg-surface-2/20 border border-primary/20 p-4 rounded-xl relative overflow-hidden flex items-start space-x-3.5"
                >
                  <span className="text-3xl select-none">{badge.emoji}</span>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-text">{badge.name}</h5>
                    <p className="text-xs text-text-muted leading-relaxed">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-sm text-text-muted">
              Complete more evaluations to unlock rewards!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
