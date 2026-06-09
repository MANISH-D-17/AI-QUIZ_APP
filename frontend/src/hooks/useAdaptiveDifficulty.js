import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook to track question answer accuracy and suggest adaptive difficulties
 * @param {string} currentDifficulty - 'Easy', 'Medium', or 'Hard'
 * @returns {object} { recordAnswer, resetDifficultyTracker }
 */
export function useAdaptiveDifficulty(currentDifficulty) {
  const [answersHistory, setAnswersHistory] = useState([]);
  const alertedRef = useRef({ low: false, high: false });

  const recordAnswer = (isCorrect) => {
    setAnswersHistory(prev => {
      const nextHistory = [...prev, isCorrect];
      
      // We analyze when we have at least 3 answers in the rolling history
      if (nextHistory.length >= 3) {
        const lastThree = nextHistory.slice(-3);
        const correctCount = lastThree.filter(Boolean).length;
        const wrongCount = 3 - correctCount;

        // Condition 1: 2+ wrong answers
        if (wrongCount >= 2 && !alertedRef.current.low) {
          if (currentDifficulty !== 'Easy') {
            const suggestedDiff = currentDifficulty === 'Hard' ? 'Medium' : 'Easy';
            toast('Having trouble? Try the ' + suggestedDiff + ' version after this! 💡', {
              duration: 5000,
              icon: '🤔',
              style: {
                background: '#1E293B',
                color: '#F1F5F9',
                border: '1px solid #F59E0B'
              }
            });
            alertedRef.current.low = true;
          }
        }

        // Condition 2: 3 consecutive correct answers
        if (correctCount === 3 && !alertedRef.current.high) {
          if (currentDifficulty !== 'Hard') {
            const suggestedDiff = currentDifficulty === 'Easy' ? 'Medium' : 'Hard';
            toast("You're on fire! Try " + suggestedDiff + " mode next time 🔥", {
              duration: 5000,
              icon: '🔥',
              style: {
                background: '#1E293B',
                color: '#F1F5F9',
                border: '1px solid #8B5CF6'
              }
            });
            alertedRef.current.high = true;
          }
        }
      }
      return nextHistory;
    });
  };

  const resetDifficultyTracker = () => {
    setAnswersHistory([]);
    alertedRef.current = { low: false, high: false };
  };

  return {
    recordAnswer,
    resetDifficultyTracker
  };
}
