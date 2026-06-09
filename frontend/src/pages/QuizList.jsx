import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SlidersHorizontal, Sparkles, Search, RefreshCw, Calendar, X, TrendingUp, Grid } from 'lucide-react';
import { useQuizFilter } from '../hooks/useQuizFilter';
import { getQuizzes } from '../services/api';
import categoriesData from '../data/categories.json';
import QuizCard from '../components/quiz/QuizCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import QuestionGenerator from '../components/ai/QuestionGenerator';
import toast from 'react-hot-toast';

export default function QuizList() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  
  // Responsive sidebar toggler for mobile devices
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Initial Filter State
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: 'All',
    difficulty: [], // 'Easy', 'Medium', 'Hard'
    duration: [], // '<5 min', '5–15 min', '>15 min'
    sortBy: 'Popular' // 'Newest', 'Popular', 'Highest Rated', 'Easiest First'
  });

  // Pull category from query parameters if navigates from Result Page or specific clicks
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam) {
      setFilters(prev => ({ ...prev, category: catParam }));
    }
  }, [location]);

  // Load custom + default quizzes dynamically from MongoDB
  useEffect(() => {
    const loadAllQuizzes = async () => {
      try {
        setLoading(true);
        const response = await getQuizzes();
        if (response && response.success && response.data) {
          setQuizzes(response.data);
        } else {
          toast.error("Failed to load quizzes from database.");
        }
      } catch (err) {
        console.error("Failed to fetch quizzes:", err);
        toast.error("Failed to connect to backend server.");
      } finally {
        setLoading(false);
      }
    };

    loadAllQuizzes();
  }, [generatorOpen]);

  // Feed filter states to custom React hook
  const filteredQuizzes = useQuizFilter(quizzes, filters);

  const handleDifficultyToggle = (diff) => {
    setFilters(prev => {
      const active = prev.difficulty.includes(diff)
        ? prev.difficulty.filter(d => d !== diff)
        : [...prev.difficulty, diff];
      return { ...prev, difficulty: active };
    });
  };

  const handleDurationToggle = (dur) => {
    setFilters(prev => {
      const active = prev.duration.includes(dur)
        ? prev.duration.filter(d => d !== dur)
        : [...prev.duration, dur];
      return { ...prev, duration: active };
    });
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'All',
      difficulty: [],
      duration: [],
      sortBy: 'Popular'
    });
  };

  const handleRemoveChip = (type, value) => {
    setFilters(prev => {
      if (type === 'search') return { ...prev, searchQuery: '' };
      if (type === 'category') return { ...prev, category: 'All' };
      if (type === 'difficulty') return { ...prev, difficulty: prev.difficulty.filter(d => d !== value) };
      if (type === 'duration') return { ...prev, duration: prev.duration.filter(d => d !== value) };
      return prev;
    });
  };

  // Compute active chips counts
  const hasActiveFilters = 
    filters.searchQuery !== '' || 
    filters.category !== 'All' || 
    filters.difficulty.length > 0 || 
    filters.duration.length > 0;

  return (
    <div className="space-y-8 animate-page relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-headings font-bold text-white tracking-tight">
            Browse Quizzes
          </h1>
          <p className="text-sm text-text-muted">
            Challenge yourself with our curated libraries or compile custom evaluations.
          </p>
        </div>

        {/* Compile Custom AI Quiz Floating button */}
        <button
          onClick={() => setGeneratorOpen(true)}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-accent to-purple-600 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-accent/20 active:scale-95 hover:brightness-110 transition-all"
        >
          <Sparkles className="h-4.5 w-4.5 fill-white animate-bounce" />
          <span>Compile Custom Quiz</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* 1. Filter Sidebar (Desktop) / Hidden on Mobile */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-6 shadow-xl sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-border/40 text-sm font-bold text-white">
              <span className="flex items-center"><SlidersHorizontal className="h-4 w-4 mr-2 text-primary" />Filters</span>
              {hasActiveFilters && (
                <button 
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-primary hover:text-emerald-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-surface-2/40 border border-border text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              >
                <option value="All">All Categories</option>
                {categoriesData.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Toggles */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Difficulty</label>
              <div className="flex flex-col space-y-2">
                {['Easy', 'Medium', 'Hard'].map((diff) => {
                  const active = filters.difficulty.includes(diff);
                  let badgeColor = 'border-border text-text-muted hover:bg-surface-2/20';
                  if (active) {
                    if (diff === 'Easy') badgeColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold';
                    if (diff === 'Medium') badgeColor = 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold';
                    if (diff === 'Hard') badgeColor = 'bg-red-500/10 border-red-500/30 text-red-400 font-bold';
                  }

                  return (
                    <button
                      key={diff}
                      onClick={() => handleDifficultyToggle(diff)}
                      className={`w-full text-left py-2 px-3 rounded-xl border text-xs transition-all duration-200 ${badgeColor}`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Toggles */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Duration</label>
              <div className="flex flex-col space-y-2">
                {['<5 min', '5–15 min', '>15 min'].map((dur) => {
                  const active = filters.duration.includes(dur);
                  return (
                    <button
                      key={dur}
                      onClick={() => handleDurationToggle(dur)}
                      className={`w-full text-left py-2 px-3 rounded-xl border text-xs transition-all duration-200 ${
                        active
                          ? 'bg-primary/10 border-primary/30 text-primary font-bold shadow-sm'
                          : 'border-border text-text-muted hover:bg-surface-2/20'
                      }`}
                    >
                      {dur}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* 2. Main content catalog */}
        <div className="flex-1 space-y-6">
          
          {/* Search + Sort Bar */}
          <div className="bg-surface border border-border rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Custom Search field */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 h-4.5 w-4.5 text-text-muted" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Search catalog title, skills..."
                className="w-full bg-surface-2/40 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-inner"
              />
            </div>

            {/* Sorting options */}
            <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
              {/* Mobile filter toggler */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden flex items-center space-x-1.5 border border-border px-3 py-2.5 rounded-xl text-xs font-bold text-text-muted hover:text-white"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-text-muted uppercase">Sort By</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="bg-surface-2/40 border border-border text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold"
                >
                  <option value="Popular">Most Taken</option>
                  <option value="Highest Rated">Highest Rated</option>
                  <option value="Newest">Newest First</option>
                  <option value="Easiest First">Easiest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-text-muted font-bold uppercase tracking-wider mr-1">Active:</span>

              {filters.searchQuery && (
                <span className="inline-flex items-center bg-surface border border-border text-white px-3 py-1 rounded-full font-semibold">
                  Query: {filters.searchQuery}
                  <X className="h-3.5 w-3.5 ml-1.5 text-text-muted hover:text-red-400 cursor-pointer" onClick={() => handleRemoveChip('search')} />
                </span>
              )}

              {filters.category !== 'All' && (
                <span className="inline-flex items-center bg-surface border border-border text-white px-3 py-1 rounded-full font-semibold">
                  Category: {filters.category}
                  <X className="h-3.5 w-3.5 ml-1.5 text-text-muted hover:text-red-400 cursor-pointer" onClick={() => handleRemoveChip('category')} />
                </span>
              )}

              {filters.difficulty.map(d => (
                <span key={d} className="inline-flex items-center bg-surface border border-border text-white px-3 py-1 rounded-full font-semibold">
                  Diff: {d}
                  <X className="h-3.5 w-3.5 ml-1.5 text-text-muted hover:text-red-400 cursor-pointer" onClick={() => handleRemoveChip('difficulty', d)} />
                </span>
              ))}

              {filters.duration.map(d => (
                <span key={d} className="inline-flex items-center bg-surface border border-border text-white px-3 py-1 rounded-full font-semibold">
                  Time: {d}
                  <X className="h-3.5 w-3.5 ml-1.5 text-text-muted hover:text-red-400 cursor-pointer" onClick={() => handleRemoveChip('duration', d)} />
                </span>
              ))}
            </div>
          )}

          {/* Catalog Count */}
          <div className="text-xs font-bold text-text-muted tracking-wider uppercase">
            Showing {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'zes' : ''}
          </div>

          {/* Quiz Grid Catalog */}
          {loading ? (
            <LoadingSkeleton type="card" count={3} />
          ) : filteredQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          ) : (
            // Catalog empty state
            <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-inner max-w-xl mx-auto space-y-4">
              <div className="h-16 w-16 bg-surface-2 rounded-full border border-border flex items-center justify-center mx-auto text-text-muted shadow-lg">
                <SlidersHorizontal className="h-8 w-8" />
              </div>
              <h3 className="font-headings font-bold text-lg text-white">No quizzes found</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                No active results match your search keywords or filter conditions. Try adjusting selectors, clearing filters, or compiling a custom quiz!
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-primary text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:brightness-110 active:scale-95 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Slideup Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          
          <div className="bg-surface border-t border-border rounded-t-3xl w-full max-h-[85vh] overflow-y-auto p-6 z-10 space-y-6 shadow-2xl relative animate-page">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <span className="font-headings font-bold text-base text-white">Adjust Filter Conditions</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-text-muted hover:text-white p-1 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-surface-2/60 border border-border text-white text-sm rounded-xl px-3 py-3"
              >
                <option value="All">All Categories</option>
                {categoriesData.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map((diff) => {
                  const active = filters.difficulty.includes(diff);
                  let btnColor = 'border-border text-text-muted';
                  if (active) {
                    if (diff === 'Easy') btnColor = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-extrabold';
                    if (diff === 'Medium') btnColor = 'bg-amber-500/20 border-amber-500 text-amber-400 font-extrabold';
                    if (diff === 'Hard') btnColor = 'bg-red-500/20 border-red-500 text-red-400 font-extrabold';
                  }

                  return (
                    <button
                      key={diff}
                      onClick={() => handleDifficultyToggle(diff)}
                      className={`py-2 px-3 rounded-xl border text-xs transition-all duration-150 text-center ${btnColor}`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {['<5 min', '5–15 min', '>15 min'].map((dur) => {
                  const active = filters.duration.includes(dur);
                  return (
                    <button
                      key={dur}
                      onClick={() => handleDurationToggle(dur)}
                      className={`py-2 px-3 rounded-xl border text-xs transition-all duration-150 text-center ${
                        active
                          ? 'bg-primary/20 border-primary text-primary font-extrabold'
                          : 'border-border text-text-muted'
                      }`}
                    >
                      {dur}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex gap-4">
              <button
                onClick={handleClearFilters}
                className="flex-1 py-3.5 border border-border text-text-muted font-bold text-sm rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="flex-grow py-3.5 bg-primary text-white font-bold text-sm rounded-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI custom generated modal popups */}
      <QuestionGenerator isOpen={generatorOpen} onClose={() => setGeneratorOpen(false)} />
    </div>
  );
}
