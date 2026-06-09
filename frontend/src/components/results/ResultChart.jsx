import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

/**
 * Recharts RadarChart for mastery visualizer
 */
export default function ResultChart({ data, type = 'radar' }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted bg-surface-2/20 border border-border/50 rounded-2xl">
        No attempt logs captured yet. Try taking some quizzes!
      </div>
    );
  }

  // Type 1: Radar spider chart for Subject Mastery in Profile
  if (type === 'radar') {
    return (
      <div className="w-full h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" radius="70%" data={data}>
            <PolarGrid stroke="var(--color-border)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 'bold' }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: 'var(--color-text-muted)', fontSize: 9 }}
              stroke="var(--color-border)"
            />
            <Radar
              name="Mastery"
              dataKey="score"
              stroke="var(--color-accent)"
              fill="var(--color-accent)"
              fillOpacity={0.25}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Type 2: Premium bar list dashboard for quiz topic breakdown
  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        let barColor = 'bg-primary';
        let textColor = 'text-primary';
        if (item.score < 50) {
          barColor = 'bg-danger';
          textColor = 'text-danger';
        } else if (item.score < 80) {
          barColor = 'bg-secondary';
          textColor = 'text-secondary';
        }

        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-text-muted">
              <span className="uppercase tracking-wider">{item.topic}</span>
              <span className={`${textColor}`}>{item.score}%</span>
            </div>
            <div className="h-2.5 w-full bg-surface-2/50 rounded-full overflow-hidden border border-border/40 relative">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
