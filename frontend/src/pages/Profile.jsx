import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Flame, 
  BookOpen, 
  Percent, 
  Clock, 
  Award, 
  Lock, 
  Calendar, 
  Edit3, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

import { getProfile, saveProfile } from '../services/storage';
import { getResults } from '../services/api';
import ResultChart from '../components/results/ResultChart';
import { formatTime } from '../utils/validation';

export default function Profile() {
  const navigate = useNavigate();

  // Local Storage States
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalTaken: 0, avgScore: 0, totalTime: 0, currentStreak: 4 });
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Mode state
  const [editMode, setEditMode] = useState(false);
  const [tempName, setTempName] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  // Mastery Radar Data
  const [masteryData, setMasteryData] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const userProfile = getProfile() || { name: "Alex", avatarInitials: "AL", unlockedBadges: [], lockedBadges: [] };
        setProfile(userProfile);
        setTempName(userProfile.name);

        // Fetch dynamic results history from MongoDB
        const attemptsRes = await getResults();
        const userAttempts = attemptsRes.data || [];

        setAttempts(userAttempts);

        // Dynamically compute stats from database records
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
          currentStreak: currentStreak || 4
        });

        // 2. Compile Mastery Radar Chart values dynamically from MongoDB records
        const categoryScores = {
          Programming: { sum: 0, count: 0 },
          History: { sum: 0, count: 0 },
          Math: { sum: 0, count: 0 },
          Science: { sum: 0, count: 0 }
        };

        userAttempts.forEach(att => {
          const cat = att.category;
          if (categoryScores[cat] !== undefined) {
            categoryScores[cat].sum += att.score;
            categoryScores[cat].count += 1;
          }
        });

        const parsedRadarData = Object.keys(categoryScores).map(cat => {
          const { sum, count } = categoryScores[cat];
          return {
            subject: cat,
            score: count > 0 ? Math.round(sum / count) : 35 // Fallback default
          };
        });

        setMasteryData(parsedRadarData);
      } catch (err) {
        console.error("Profile failed to load database records:", err);
        toast.error("Failed to load user profile statistics from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text">
        <div className="animate-pulse text-primary font-bold text-lg">
          ✦ Synching user records from MongoDB...
        </div>
      </div>
    );
  }

  // Update Username Profile handler
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (tempName.trim() === '') {
      toast.error("Name cannot be empty!");
      return;
    }

    const updated = {
      ...profile,
      name: tempName,
      avatarInitials: tempName.slice(0, 2).toUpperCase()
    };

    saveProfile(updated);
    setProfile(updated);
    setEditMode(false);
    
    // Broadcast updates to sync other layers (e.g. Navbar) instantly
    window.dispatchEvent(new Event('profile-updated'));

    toast.success("Profile saved successfully!", {
      style: {
        background: '#1E293B',
        color: '#F1F5F9',
        border: '1px solid #10B981'
      }
    });
  };

  // Pagination calculation
  const totalPages = Math.ceil(attempts.length / itemsPerPage);
  const indexOfLastAttempt = currentPage * itemsPerPage;
  const indexOfFirstAttempt = indexOfLastAttempt - itemsPerPage;
  const currentAttempts = attempts.slice(indexOfFirstAttempt, indexOfLastAttempt);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const totalHours = (stats.totalTime / 3600).toFixed(1);

  // Available All Badges Map for visualization
  const allBadgesMetadata = {
    "AI Explorer 🤖": { icon: '🤖', name: 'AI Explorer', desc: 'Compiled a custom quiz via AI generator.' },
    "Marathoner 🏃": { icon: '🏃', name: 'Marathoner', desc: 'Finished over 3 standard learning evaluations.' },
    "Speedster ⚡": { icon: '⚡', name: 'Speedster', desc: 'Finished in less than 2 minutes with >= 80% score.' },
    "Perfect Score 🏆": { icon: '🏆', name: 'Perfect Score', desc: 'Finished a quiz with a perfect 100% score.' }
  };

  return (
    <div className="space-y-10 animate-page pb-12">
      
      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 group">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 w-full md:w-auto">
          {/* Circular avatar Initials */}
          <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-tr from-accent via-indigo-500 to-primary p-[3px] shadow-lg">
            <div className="h-full w-full rounded-full bg-surface-2 flex items-center justify-center border border-border">
              <span className="text-xl md:text-2xl font-extrabold text-text tracking-widest uppercase">
                {profile.avatarInitials || "AL"}
              </span>
            </div>
          </div>

          <div className="text-center md:text-left space-y-2">
            {editMode ? (
              <form onSubmit={handleSaveProfile} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-surface-2 border border-border text-text text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-bold"
                  maxLength={15}
                  required
                />
                <button
                  type="submit"
                  className="bg-primary text-white font-bold text-xs px-3 py-2 rounded-xl hover:brightness-110"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="text-xs text-text-muted hover:text-white px-2 py-1"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <h2 className="text-2xl font-headings font-bold text-text tracking-tight">
                  {profile.name}
                </h2>
                <button 
                  onClick={() => setEditMode(true)}
                  className="text-text-muted hover:text-text p-1 rounded hover:bg-surface-2/40 transition-colors"
                  aria-label="Edit Profile Name"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-center md:justify-start space-x-1.5 text-xs text-text-muted font-bold">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Joined May 2026</span>
            </div>
          </div>
        </div>

        {/* Action parameters */}
        <div className="flex items-center space-x-2 z-10">
          <Link
            to="/quizzes"
            className="flex items-center space-x-1.5 bg-primary text-white font-bold text-xs px-5 py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md"
          >
            <span>Start Practice</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* 2. STATS ROW GRID */}
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

      {/* 3. PERFORMANCE MASTERY CHART AND BADGES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Mastery Radar Chart */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <h3 className="text-lg font-headings font-bold text-text tracking-wider uppercase">
              Subject Mastery Index
            </h3>
            <div className="flex items-center text-xs text-text-muted font-bold">
              <TrendingUp className="h-4 w-4 text-accent mr-1 animate-pulse" />
              <span>AI Gap Analysis</span>
            </div>
          </div>

          <ResultChart data={masteryData} type="radar" />
        </div>

        {/* Right: Badges Collection grid */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-6">
          <div className="pb-3 border-b border-border/40">
            <h3 className="text-lg font-headings font-bold text-text tracking-wider uppercase flex items-center">
              <Award className="h-5 w-5 text-primary mr-2" />
              Rewards & Badges
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Unlocked Badges */}
            {profile.unlockedBadges.map((badgeName) => {
              const meta = allBadgesMetadata[badgeName] || { icon: '🏆', name: badgeName, desc: 'Earned and unlocked!' };
              return (
                <div 
                  key={badgeName}
                  className="bg-surface-2/20 border border-primary/20 p-4 rounded-2xl relative overflow-hidden flex items-start space-x-3.5 hover:border-primary/45 transition-colors group shadow-inner"
                >
                  <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10" />
                  <span className="text-3xl select-none" role="img" aria-label={meta.name}>
                    {meta.icon}
                  </span>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-text group-hover:text-primary transition-colors">
                      {meta.name}
                    </h5>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {meta.desc}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Locked Badges */}
            {profile.lockedBadges.map((badgeName) => {
              const meta = allBadgesMetadata[badgeName] || { icon: '🔒', name: badgeName, desc: 'Keep practicing!' };
              return (
                <div 
                  key={badgeName}
                  className="bg-surface/5 border border-border/40 p-4 rounded-2xl flex items-start space-x-3.5 opacity-40 select-none cursor-default"
                >
                  <div className="h-9 w-9 bg-surface-2/40 border border-border rounded-full flex items-center justify-center flex-shrink-0">
                    <Lock className="h-4.5 w-4.5 text-text-muted" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-text-muted flex items-center">
                      {meta.name}
                    </h5>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {meta.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. ATTEMPT HISTORY LEDGER */}
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <h3 className="text-xl font-headings font-bold text-text">
            Historical Attempts Log
          </h3>
          <span className="text-xs text-text-muted font-bold">
            Total {attempts.length} attempts
          </span>
        </div>

        {attempts.length > 0 ? (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] text-text-muted font-bold tracking-wider uppercase bg-surface-2/10">
                    <th className="py-4 px-6">Quiz Name</th>
                    <th className="py-4 px-6 text-center">Score</th>
                    <th className="py-4 px-6 text-center">Time Spent</th>
                    <th className="py-4 px-6">Completed Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {currentAttempts.map((att) => {
                    let scoreBadge = 'text-primary bg-primary/10 border-primary/20';
                    if (att.score < 50) {
                      scoreBadge = 'text-danger bg-danger/10 border-danger/20';
                    } else if (att.score < 80) {
                      scoreBadge = 'text-secondary bg-amber-500/10 border-amber-500/20';
                    }

                    return (
                      <tr key={att._id || att.id} className="hover:bg-surface-2/20 transition-colors">
                        <td className="py-4 px-6 font-bold text-text">{att.quizTitle}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${scoreBadge}`}>
                            {att.score}%
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center text-text-muted font-mono">{formatTime(att.timeTaken)}</td>
                        <td className="py-4 px-6 text-text-muted">{att.date}</td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            to={`/result/${att._id || att.id}`}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-primary hover:text-emerald-300 transition-colors"
                          >
                            <span>Review</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-4 bg-surface-2/10">
                <span className="text-xs text-text-muted font-semibold">
                  Page {currentPage} of {totalPages}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded bg-surface border border-border text-text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded bg-surface border border-border text-text-muted hover:text-text disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center text-sm text-text-muted">
            No attempts logged. Start practicing now to unlock rewards!
          </div>
        )}
      </div>
    </div>
  );
}
