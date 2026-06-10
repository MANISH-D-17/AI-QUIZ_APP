import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Globe, Users, Clock, Award, Star, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLeaderboard } from '../services/api';
import quizzesData from '../data/quizzes.json';
import { formatTime } from '../utils/validation';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('global'); 
  const [selectedQuizId, setSelectedQuizId] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        // Fetch actual leaderboards from MongoDB backend API
        const attemptsRes = await getLeaderboard(selectedQuizId);
        const allAttempts = attemptsRes.data || [];

        const profile = JSON.parse(localStorage.getItem('profile')) || { name: 'User', avatarInitials: 'U' };

        // Process results to keep highest score per user
        const userBestScores = {};
        allAttempts.forEach(att => {
          const userName = att.userName || 'Unknown User';
          if (!userBestScores[userName] || userBestScores[userName].score < att.score || (userBestScores[userName].score === att.score && userBestScores[userName].timeTaken > att.timeTaken)) {
            userBestScores[userName] = att;
          }
        });

        const combined = Object.values(userBestScores).map(att => {
          const userName = att.userName || 'Unknown User';
          const isCurrentUser = userName === profile.name;
          const bgColors = ['bg-emerald-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500', 'bg-rose-500'];
          // Use name length to pick a stable color
          const colorIndex = userName.length % bgColors.length;

          return {
            username: isCurrentUser ? `${userName} (You) 🌟` : userName,
            score: att.score,
            timeTaken: att.timeTaken,
            date: att.date,
            isUser: isCurrentUser,
            initials: userName.substring(0, 2).toUpperCase(),
            bg: isCurrentUser ? 'bg-gradient-to-tr from-primary to-accent' : bgColors[colorIndex]
          };
        });

        // Sort dynamically: highest score, lowest time
        combined.sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return a.timeTaken - b.timeTaken;
        });

        setLeaderboardData(combined);
      } catch (err) {
        console.error("Leaderboard failed to fetch data:", err);
        toast.error("Failed to sync rankings with MongoDB backend.");
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [selectedQuizId]);

  const handleFriendsTabClick = () => {
    toast('Friends connection features are coming soon! 🚀', {
      icon: '🤖',
      style: {
        background: '#1E293B',
        color: '#F1F5F9',
        border: '1px solid #8B5CF6'
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text">
        <div className="animate-pulse text-primary font-bold text-lg">
          ✦ Synching rankings with MongoDB...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-page">
      {/* 1. Header Title */}
      <div className="pb-4 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headings font-bold text-text tracking-tight flex items-center">
            <Trophy className="h-8 w-8 text-amber-400 mr-3 animate-pulse" />
            Global Rankings
          </h1>
          <p className="text-sm text-text-muted">
            Measure your analytical speed and correctness against active learners worldwide.
          </p>
        </div>
      </div>

      {/* 2. Tabs Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Navigation tabs */}
        <div className="bg-surface border border-border p-1.5 rounded-2xl flex items-center space-x-1 w-full md:w-auto shadow-inner">
          <button
            onClick={() => setActiveTab('global')}
            className={`flex-1 md:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'global'
                ? 'bg-surface-2 text-text shadow-md'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Global</span>
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 md:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'weekly'
                ? 'bg-surface-2 text-text shadow-md'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>This Week</span>
          </button>

          <button
            onClick={handleFriendsTabClick}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-text-muted/40 cursor-not-allowed hover:text-text-muted/65 transition-all select-none"
            title="Coming Soon!"
          >
            <Users className="h-4 w-4" />
            <span>Friends (Locked)</span>
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="text-xs font-bold text-text-muted uppercase flex-shrink-0">Filter Quiz</span>
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="w-full md:w-48 bg-surface border border-border text-text text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold"
          >
            <option value="all">All Quizzes Combined</option>
            {quizzesData.map(q => (
              <option key={q.id} value={q.id}>{q.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Leaderboard Grid/Table */}
      <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-[10px] text-text-muted font-bold tracking-wider uppercase bg-surface-2/10">
                <th className="py-4 px-6 text-center w-20">Rank</th>
                <th className="py-4 px-6">Learner Profile</th>
                <th className="py-4 px-6 text-center">Best Score</th>
                <th className="py-4 px-6 text-center">Solve Speed</th>
                <th className="py-4 px-6">Evaluation Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm">
              {leaderboardData.map((user, index) => {
                const rankNum = index + 1;
                let rankBadge = <span className="font-mono text-text-muted font-bold">#{rankNum}</span>;
                
                if (rankNum === 1) {
                  rankBadge = <span className="text-2xl" role="img" aria-label="First place">🥇</span>;
                } else if (rankNum === 2) {
                  rankBadge = <span className="text-2xl" role="img" aria-label="Second place">🥈</span>;
                } else if (rankNum === 3) {
                  rankBadge = <span className="text-2xl" role="img" aria-label="Third place">🥉</span>;
                }

                return (
                  <tr 
                    key={index} 
                    className={`transition-all duration-200 ${
                      user.isUser 
                        ? 'bg-gradient-to-r from-primary/5 via-accent/5 to-transparent border-l-4 border-l-primary font-bold shadow-[inset_0_0_12px_rgba(16,185,129,0.05)]' 
                        : 'hover:bg-surface-2/10'
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-4 px-6 text-center">{rankBadge}</td>

                    {/* Learner Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className={`h-9 w-9 rounded-full ${user.bg} flex items-center justify-center border border-border shadow-md`}>
                          <span className="text-xs font-bold text-text uppercase tracking-wider">
                            {user.initials}
                          </span>
                        </div>
                        <span className={`text-sm ${user.isUser ? 'text-primary' : 'text-text font-semibold'}`}>
                          {user.username}
                        </span>
                      </div>
                    </td>

                    {/* Accuracy Score */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center text-xs font-extrabold px-3 py-1 rounded-full border ${
                        user.score >= 80 
                          ? 'text-primary bg-primary/10 border-primary/20' 
                          : 'text-secondary bg-amber-500/10 border-amber-500/20'
                      }`}>
                        {user.score}%
                      </span>
                    </td>

                    {/* Solve Speed */}
                    <td className="py-4 px-6 text-center font-mono text-xs text-text-muted">
                      <div className="flex items-center justify-center space-x-1.5">
                        <Clock className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                        <span>{user.timeTaken > 0 ? formatTime(user.timeTaken) : 'N/A'}</span>
                      </div>
                    </td>

                    {/* Attempt Date */}
                    <td className="py-4 px-6 text-xs text-text-muted">{user.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
