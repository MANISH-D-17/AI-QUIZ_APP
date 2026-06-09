import React from 'react';

/**
 * Animated gradient progress bar showing active milestones
 */
export default function ProgressBar({ current, total }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      {/* Percentage label */}
      <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-text-muted">
        <span>PROGRESS</span>
        <span className="text-white bg-surface px-2 py-0.5 rounded-md border border-border">{percentage}%</span>
      </div>

      {/* Progress track */}
      <div className="w-full bg-surface-2/40 h-3 rounded-full overflow-hidden border border-border/50 relative">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
