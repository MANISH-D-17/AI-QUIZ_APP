import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Star, ArrowRight } from 'lucide-react';
import Badge from '../common/Badge';
import { getAttempts } from '../../services/storage';

export default function QuizCard({ quiz }) {
  const navigate = useNavigate();
  const [highScore, setHighScore] = useState(null);

  // Dynamic score computation based on localStorage history
  useEffect(() => {
    const attempts = getAttempts();
    const quizAttempts = attempts.filter(att => att.quizId === quiz.id);
    if (quizAttempts.length > 0) {
      const maxScore = Math.max(...quizAttempts.map(att => att.score));
      setHighScore(maxScore);
    } else {
      setHighScore(null);
    }
  }, [quiz.id]);

  // Convert duration to minutes
  const durationMins = Math.round(quiz.duration / 60);

  // SVG Circular progress configurations
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = highScore !== null 
    ? circumference - (highScore / 100) * circumference 
    : circumference;

  const handleStart = () => {
    navigate(`/quiz/${quiz.id}`);
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] hover:border-primary/30 transition-all duration-300 flex flex-col justify-between h-full group relative overflow-hidden">
      {/* Decorative subtle background glows */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-300" />
      
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <Badge type="category" value={quiz.category} />
          <Badge type="difficulty" value={quiz.difficulty} />
        </div>

        {/* Title */}
        <h4 className="font-headings font-bold text-lg text-text mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {quiz.title}
        </h4>

        {/* Description */}
        <p className="text-text-muted text-sm leading-relaxed mb-5 line-clamp-2">
          {quiz.description}
        </p>

        {/* Metrics Row */}
        <div className="flex items-center space-x-4 text-xs text-text-muted font-semibold mb-6">
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1 text-primary" />
            <span>{quiz.questionsCount} Questions</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-secondary" />
            <span>{durationMins} Mins</span>
          </div>
          {quiz.rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-amber-400 fill-amber-400" />
              <span>{quiz.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Call To Actions */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
        {/* Circular Progress Ring or Taken Indicator */}
        <div className="flex items-center space-x-3">
          <div className="relative h-12 w-12 flex items-center justify-center">
            <svg className="transform -rotate-90 w-12 h-12">
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-surface-2 fill-transparent"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                className={`fill-transparent transition-all duration-500 ${
                  highScore !== null && highScore >= 80 ? 'stroke-primary' : 'stroke-secondary'
                }`}
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-text">
              {highScore !== null ? `${highScore}%` : '—'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
              {highScore !== null ? 'Best Attempt' : 'Status'}
            </span>
            <span className="text-xs text-text font-semibold">
              {highScore !== null ? 'Completed' : 'Not Taken'}
            </span>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="flex items-center space-x-1.5 bg-primary text-white font-bold px-4 py-2.5 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md group-hover:shadow-primary/20 group-hover:scale-105"
        >
          <span>Start</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
