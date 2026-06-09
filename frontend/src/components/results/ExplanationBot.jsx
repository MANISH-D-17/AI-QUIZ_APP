import React, { useState } from 'react';
import { Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Badge from '../common/Badge';
import { getExplanation } from '../../services/mockAI';

/**
 * AI Explanationbot display panel
 */
export default function ExplanationBot({ question, correctAnswerText }) {
  const [expanded, setExpanded] = useState(false);
  
  // Dynamic lookup of explanation data
  const explanationData = getExplanation(question.id, question.explanation);

  return (
    <div className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-purple-500/20 rounded-2xl p-5 mt-4 relative overflow-hidden">
      {/* Decorative sparkles */}
      <div className="absolute -top-6 -right-6 w-16 h-16 bg-purple-500/5 rounded-full blur-xl" />
      
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4.5 w-4.5 text-purple-400 fill-purple-400 animate-pulse" />
          <h5 className="font-headings font-bold text-sm text-purple-200 tracking-wide">
            AI Explanation Assistant
          </h5>
        </div>
        <Badge type="ai" value="✦ AI Insight" />
      </div>

      {/* Main explanation body */}
      <div className="text-sm text-purple-100/90 leading-relaxed space-y-3">
        <p>
          The correct answer is <span className="text-primary font-bold">"{correctAnswerText}"</span> because {explanationData.reason}
        </p>

        {/* Mnemonic / Tip */}
        {explanationData.tip && (
          <div className="bg-purple-950/30 border border-purple-500/10 p-3 rounded-xl text-purple-300 text-xs italic">
            {explanationData.tip}
          </div>
        )}

        {/* Dynamic Detail Expansion */}
        {expanded && (
          <div className="text-purple-200/80 text-xs pt-2 border-t border-purple-500/10 leading-relaxed animate-page">
            <span className="font-bold text-purple-400 block mb-1">DEEP ANALYSIS:</span>
            {explanationData.moreDetail}
          </div>
        )}

        {/* Trigger Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center space-x-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors pt-2 focus:outline-none"
        >
          <span>{expanded ? 'Show Less' : 'Tell me more'}</span>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}
