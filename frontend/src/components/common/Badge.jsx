import React from 'react';
import { Sparkles, Code, BookOpen, Calculator, Atom, HelpCircle } from 'lucide-react';

/**
 * Reusable Category/Difficulty/AI Badge
 */
export default function Badge({ type = 'category', value = '', customClass = '' }) {
  // 1. Difficulty Tag Styles
  if (type === 'difficulty') {
    const diff = String(value).toLowerCase();
    let styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (diff === 'medium') {
      styles = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    } else if (diff === 'hard') {
      styles = 'bg-red-500/10 text-red-400 border-red-500/20';
    }

    return (
      <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${styles} ${customClass}`}>
        {value}
      </span>
    );
  }

  // 2. AI Feature Tag Styles
  if (type === 'ai') {
    return (
      <span className={`inline-flex items-center text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full shadow-sm select-none ${customClass}`}>
        <Sparkles className="h-3 w-3 mr-1 text-purple-400 fill-purple-400 animate-pulse" />
        <span>{value || '✦ AI Picks'}</span>
      </span>
    );
  }

  // 3. Category Tag Styles
  const cat = String(value).toLowerCase();
  let icon = <HelpCircle className="h-3.5 w-3.5 mr-1" />;
  let colorStyles = 'bg-slate-500/10 text-slate-300 border-slate-500/20';

  if (cat === 'programming') {
    icon = <Code className="h-3.5 w-3.5 mr-1" />;
    colorStyles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (cat === 'history') {
    icon = <BookOpen className="h-3.5 w-3.5 mr-1" />;
    colorStyles = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (cat === 'math') {
    icon = <Calculator className="h-3.5 w-3.5 mr-1" />;
    colorStyles = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
  } else if (cat === 'science') {
    icon = <Atom className="h-3.5 w-3.5 mr-1" />;
    colorStyles = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
  }

  return (
    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${colorStyles} ${customClass}`}>
      {icon}
      <span>{value}</span>
    </span>
  );
}
