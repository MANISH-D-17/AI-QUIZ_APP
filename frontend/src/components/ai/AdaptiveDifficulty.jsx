import React from 'react';
import { Sparkles, ArrowRight, X, AlertTriangle, Flame } from 'lucide-react';

/**
 * Slide-in adaptive difficulty suggestion alert card
 */
export default function AdaptiveDifficulty({ 
  isOpen, 
  suggestion, // 'Easy' or 'Hard' or 'Medium'
  type, // 'low' (struggling) or 'high' (breezing)
  onConfirm, 
  onClose 
}) {
  if (!isOpen) return null;

  const isStruggling = type === 'low';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-surface border border-purple-500/30 rounded-2xl shadow-2xl p-5 animate-page backdrop-blur-md relative overflow-hidden">
      {/* Glow effect */}
      <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 ${
        isStruggling ? 'bg-amber-500' : 'bg-accent'
      }`} />

      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-3 right-3 text-text-muted hover:text-white p-1 rounded-lg hover:bg-surface-2 transition-colors"
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="flex items-center space-x-2 mb-3">
        {isStruggling ? (
          <AlertTriangle className="h-5 w-5 text-secondary" />
        ) : (
          <Flame className="h-5 w-5 text-accent fill-accent animate-bounce" />
        )}
        <span className="font-headings font-bold text-sm text-white">
          {isStruggling ? 'AI Difficulty Tuning' : "You're on Fire! 🔥"}
        </span>
      </div>

      {/* Body Text */}
      <p className="text-xs text-text-muted leading-relaxed mb-4">
        {isStruggling 
          ? `We noticed the concepts are challenging. Our AI engine recommends trying the ${suggestion} version to build confidence.`
          : `Excellent streak! You've mastered these concepts easily. Try ${suggestion} mode next time to push your limits!`
        }
      </p>

      {/* Footer / Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border/40">
        <button
          onClick={onClose}
          className="text-xs font-bold text-text-muted hover:text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          Dismiss
        </button>
        <button
          onClick={onConfirm}
          className={`flex items-center space-x-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 ${
            isStruggling 
              ? 'bg-secondary hover:brightness-110' 
              : 'bg-accent hover:brightness-110'
          }`}
        >
          <span>{isStruggling ? `Try ${suggestion}` : `Aim Higher`}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
