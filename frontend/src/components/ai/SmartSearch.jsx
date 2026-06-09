import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { smartSearch } from '../../services/mockAI';

/**
 * AI-powered Smart Search component with fuzzy matches and suggestions popover
 */
export default function SmartSearch({ quizzes, placeholder = "Search quizzes by topic, skill, or keyword..." }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close suggestions popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions on query change
  useEffect(() => {
    if (query.trim() === '') {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Call fuzzy smartSearch from MockAI
    const results = smartSearch(query, quizzes);
    setSuggestions(results.slice(0, 5)); // Limit to top 5 results
    setIsOpen(true);
  }, [query, quizzes]);

  const handleSuggestionClick = (quizId) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/quiz/${quizId}`);
  };

  return (
    <div ref={containerRef} className="w-full relative z-30">
      {/* Input container */}
      <div className="relative flex items-center">
        {/* Left Search Icon */}
        <Search className="absolute left-4 h-5 w-5 text-text-muted" />

        {/* Search Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() !== '' && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-surface border border-border focus:border-accent hover:border-border-2 rounded-2xl pl-12 pr-32 py-4 text-base text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 shadow-xl transition-all duration-300"
        />

        {/* Right AI Sparkle Badge Overlay */}
        <div className="absolute right-3 flex items-center bg-purple-500/15 border border-purple-500/30 px-3 py-1.5 rounded-xl text-purple-300 text-xs font-bold shadow-sm select-none cursor-default">
          <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-400 fill-purple-400 animate-pulse" />
          <span>AI Search</span>
        </div>
      </div>

      {/* Floating Suggestions Dropdown Popover */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border/80 rounded-2xl shadow-2xl overflow-hidden animate-page backdrop-blur-md">
          <div className="px-4 py-2 border-b border-border/40 text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center justify-between">
            <span>✦ AI Fuzzy matches</span>
            <span>{suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}</span>
          </div>

          <div className="divide-y divide-border/40">
            {suggestions.map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => handleSuggestionClick(quiz.id)}
                className="px-4 py-3.5 hover:bg-surface-2/40 cursor-pointer flex items-center justify-between group transition-colors duration-200"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate">
                      {quiz.title}
                    </h5>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-2 border border-border text-text-muted uppercase">
                      {quiz.category}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted truncate">
                    {quiz.description}
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-xs font-bold text-text-muted flex-shrink-0">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5 text-secondary" />
                    <span>{Math.round(quiz.duration / 60)}m</span>
                  </div>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 group-hover:text-primary transition-all duration-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestion empty state dropdown */}
      {isOpen && query.trim() !== '' && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border/80 rounded-2xl shadow-2xl p-6 text-center text-sm text-text-muted backdrop-blur-md">
          No matches found for "<span className="text-white font-bold">{query}</span>". Try other keywords like 'python', 'easy', or 'algebra'.
        </div>
      )}
    </div>
  );
}
