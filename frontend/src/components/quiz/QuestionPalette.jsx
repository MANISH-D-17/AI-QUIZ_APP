import React from 'react';
import { Bookmark, CheckCircle2, Circle } from 'lucide-react';

/**
 * QuestionPalette sidebar displaying active states for each question block in the quiz.
 */
export default function QuestionPalette({
  questions,
  currentQuestionIndex,
  onJumpToQuestion,
  answers, // Object mapping questionId or index to selected answer index
  flaggedQuestions // Set or Array of flagged question indexes
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-xl w-full">
      <h5 className="font-headings font-bold text-sm text-white tracking-wider uppercase mb-4 pb-2 border-b border-border/60">
        Question Map
      </h5>

      {/* Grid Palette */}
      <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {questions.map((question, idx) => {
          const isCurrent = idx === currentQuestionIndex;
          const isAnswered = answers[idx] !== undefined && answers[idx] !== null;
          const isFlagged = flaggedQuestions.includes(idx);

          let stateStyles = 'bg-surface-2/20 border-border/80 text-text-muted hover:bg-surface-2/60';
          
          if (isAnswered) {
            stateStyles = 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20';
          }
          if (isFlagged) {
            stateStyles = 'bg-amber-500/10 border-amber-500/30 text-secondary hover:bg-amber-500/20';
          }
          if (isCurrent) {
            stateStyles += ' ring-2 ring-white border-transparent text-white';
          }

          return (
            <button
              key={question.id}
              onClick={() => onJumpToQuestion(idx)}
              className={`h-10 w-10 flex items-center justify-center rounded-xl border font-bold text-sm transition-all duration-200 active:scale-95 ${stateStyles}`}
              aria-label={`Jump to question ${idx + 1}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend Descriptions */}
      <div className="mt-6 pt-4 border-t border-border/40 space-y-2.5 text-xs text-text-muted font-semibold">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 rounded bg-surface border border-border flex items-center justify-center">
            <Circle className="h-2 w-2 text-text-muted" />
          </div>
          <span>Unanswered</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 rounded bg-primary/15 border border-primary/30 flex items-center justify-center">
            <CheckCircle2 className="h-2.5 w-2.5 text-primary fill-primary/10" />
          </div>
          <span>Answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 rounded bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Bookmark className="h-2.5 w-2.5 text-secondary fill-secondary/10" />
          </div>
          <span>Flagged Review</span>
        </div>
      </div>
    </div>
  );
}
