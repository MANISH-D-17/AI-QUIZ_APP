import React from 'react';
import { CheckCircle2, XCircle, BarChart3 } from 'lucide-react';

/**
 * Renders structured list of subtopic cards based on answers accuracy
 */
export default function TopicBreakdown({ topicsData }) {
  if (!topicsData || topicsData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {topicsData.map((item, idx) => {
        const percent = item.score;
        let scoreColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
        let barColor = 'bg-primary';

        if (percent < 50) {
          scoreColor = 'text-red-400 bg-red-500/15 border-red-500/30';
          barColor = 'bg-danger';
        } else if (percent < 80) {
          scoreColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
          barColor = 'bg-secondary';
        }

        return (
          <div 
            key={idx}
            className="bg-surface-2/20 border border-border/80 rounded-2xl p-4 flex flex-col justify-between hover:border-border transition-all duration-200"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <span className="font-headings font-bold text-sm text-white tracking-wide truncate pr-2">
                {item.topic}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreColor}`}>
                {percent}%
              </span>
            </div>

            {/* Visual Mini Progress Bar */}
            <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-border/40 mb-3">
              <div 
                className={`h-full rounded-full ${barColor} transition-all duration-700`}
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Answer Metrics Footer */}
            <div className="flex items-center justify-between text-[11px] text-text-muted font-bold">
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>{item.correct} Correct</span>
              </div>
              <div className="flex items-center space-x-1">
                <XCircle className="h-3.5 w-3.5 text-danger" />
                <span>{item.total - item.correct} Wrong</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
