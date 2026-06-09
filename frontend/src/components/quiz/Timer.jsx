import React from 'react';
import { Clock } from 'lucide-react';

/**
 * Visual countdown timer component with accessible status announcer
 */
export default function Timer({ formattedTime, isWarning, timeLeft }) {
  return (
    <div 
      className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-300 font-mono font-extrabold text-sm md:text-base ${
        isWarning
          ? 'bg-red-500/10 text-danger border-danger animate-pulse-warning shadow-[0_0_12px_rgba(239,68,68,0.2)]'
          : 'bg-surface border-border text-white'
      }`}
      role="status"
      aria-live="polite"
      aria-label={`Time remaining: ${formattedTime}`}
    >
      <Clock className={`h-4.5 w-4.5 ${isWarning ? 'text-danger animate-spin-slow' : 'text-primary'}`} />
      <span>{formattedTime}</span>
    </div>
  );
}
