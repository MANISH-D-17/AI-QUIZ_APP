// Scoring Utility for Quiz Platform

/**
 * Calculates letter grade and visual properties from a percentage score
 * @param {number} percent 
 * @returns {object} { grade, colorClass, borderClass, message, description }
 */
export function calculateGrade(percent) {
  if (percent >= 90) {
    return {
      grade: 'A',
      colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      textOnlyColor: 'text-emerald-400',
      borderClass: 'border-emerald-500',
      bgClass: 'bg-emerald-500',
      message: 'Outstanding Performance! 🏆',
      description: "You've demonstrated exceptional mastery! Your analytical skills and conceptual understanding are top-notch. Keep crushing it!"
    };
  } else if (percent >= 75) {
    return {
      grade: 'B',
      colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      textOnlyColor: 'text-indigo-400',
      borderClass: 'border-indigo-500',
      bgClass: 'bg-indigo-500',
      message: 'Great job, Alex! 🌟',
      description: "Solid knowledge baseline! You possess a robust comprehension of the subject, with only a few minor conceptual gaps to review."
    };
  } else if (percent >= 50) {
    return {
      grade: 'C',
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      textOnlyColor: 'text-amber-400',
      borderClass: 'border-amber-500',
      bgClass: 'bg-amber-500',
      message: 'Room to Grow! 📈',
      description: "Decent attempt. You have grasped the basic concepts, but you would benefit from reviewing explanations and retaking the quiz to solidify your understanding."
    };
  } else {
    return {
      grade: 'F',
      colorClass: 'text-red-400 bg-red-500/10 border-red-500/30',
      textOnlyColor: 'text-red-400',
      borderClass: 'border-red-500',
      bgClass: 'bg-red-500',
      message: 'Keep Practicing! 💪',
      description: "This is a learning opportunity. The concepts are challenging, but with targeted practice, reviewing the AI explanations, and focused revision, you will improve!"
    };
  }
}
