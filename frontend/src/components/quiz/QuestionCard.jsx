import React, { useEffect, useRef } from 'react';
import { Bookmark, BookmarkCheck, CheckCircle2, XCircle } from 'lucide-react';
import Badge from '../common/Badge';

/**
 * QuestionCard displays a single question and its options with full accessibility and interactive transitions.
 */
export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer, // index of selected option
  onSelectAnswer,
  isFlagged,
  onToggleFlag,
  reviewMode = false, // if true, shows correctness styling immediately
  userAnswerIndex = null, // in review mode, what the user picked
  correctAnswerIndex = null // in review mode, the correct answer index
}) {
  const optionsRefs = useRef([]);

  // Adjust refs length
  useEffect(() => {
    optionsRefs.current = optionsRefs.current.slice(0, question.options.length);
  }, [question.options]);

  // Handle keyboard navigation for options
  const handleKeyDown = (e, index) => {
    if (reviewMode) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectAnswer(index);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % question.options.length;
      optionsRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + question.options.length) % question.options.length;
      optionsRefs.current[prevIndex]?.focus();
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-xl max-w-3xl w-full mx-auto relative overflow-hidden transition-all duration-300">
      {/* Top Details */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-bold text-primary tracking-wider uppercase bg-primary/10 px-3 py-1 rounded-lg">
            Question {questionNumber} of {totalQuestions}
          </span>
          <Badge type="category" value={question.topic} />
        </div>

        {/* Flag for Review Bookmark Button */}
        <button
          onClick={onToggleFlag}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
            isFlagged
              ? 'bg-amber-500/15 text-secondary border-amber-500/40 shadow-inner'
              : 'bg-surface-2/40 text-text-muted border-border hover:text-text hover:bg-surface-2/70'
          }`}
          aria-label={isFlagged ? "Remove bookmark flag" : "Bookmark flag for review"}
        >
          {isFlagged ? (
            <>
              <BookmarkCheck className="h-4 w-4 text-secondary fill-secondary animate-scale-in" />
              <span className="hidden sm:inline">Flagged</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">Flag for Review</span>
            </>
          )}
        </button>
      </div>

      {/* Question Text */}
      <h3 className="text-xl md:text-2xl font-bold leading-relaxed text-white mb-6">
        {question.questionText}
      </h3>

      {/* Optional image display if imageUrl exists */}
      {question.imageUrl && (
        <div className="w-full rounded-xl overflow-hidden mb-6 border border-border max-h-64 flex justify-center bg-slate-950">
          <img src={question.imageUrl} alt="Question Visual" className="object-contain" />
        </div>
      )}

      {/* Options grid */}
      <div className="space-y-4" role="radiogroup" aria-label="Answer options">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          let optionStyles = 'border-border bg-surface-2/20 text-text hover:bg-surface-2/40 hover:border-border-2';
          let showIcon = null;

          if (reviewMode) {
            const isCorrect = idx === correctAnswerIndex;
            const isUserChoice = idx === userAnswerIndex;

            if (isCorrect) {
              // Highlight correct answer in green
              optionStyles = 'border-primary bg-primary/10 text-white animate-correct';
              showIcon = <CheckCircle2 className="h-5 w-5 text-primary fill-primary/10 mr-3 animate-scale-in flex-shrink-0" />;
            } else if (isUserChoice) {
              // User picked a wrong answer
              optionStyles = 'border-danger bg-danger/10 text-white animate-wrong';
              showIcon = <XCircle className="h-5 w-5 text-danger fill-danger/10 mr-3 animate-scale-in flex-shrink-0" />;
            } else {
              // Unselected wrong options
              optionStyles = 'border-border/40 opacity-60 text-text-muted';
            }
          } else {
            // Taking Mode Styles
            if (isSelected) {
              optionStyles = 'border-primary bg-primary/10 text-white ring-1 ring-primary';
              showIcon = <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center mr-3 animate-scale-in flex-shrink-0"><div className="h-2 w-2 rounded-full bg-white" /></div>;
            } else {
              showIcon = <div className="h-5 w-5 rounded-full border border-text-muted mr-3 flex-shrink-0" />;
            }
          }

          return (
            <div
              key={idx}
              ref={el => optionsRefs.current[idx] = el}
              onClick={() => !reviewMode && onSelectAnswer(idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              tabIndex={reviewMode ? -1 : 0}
              role="radio"
              aria-checked={isSelected}
              className={`flex items-center p-4 rounded-xl border text-base font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 relative overflow-hidden ${optionStyles}`}
            >
              {showIcon}
              <span className="flex-1 select-none pr-2">{option}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
