import { useMemo } from 'react';
import { smartSearch } from '../services/mockAI';

/**
 * Hook to filter and sort a collection of quizzes
 * @param {Array} quizzes 
 * @param {object} filters { searchQuery, category, difficulty, duration, sortBy }
 * @returns {Array} processedQuizzes
 */
export function useQuizFilter(quizzes, filters) {
  return useMemo(() => {
    if (!quizzes) return [];

    let result = [...quizzes];

    // 1. Apply Smart/Fuzzy Search Query
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      result = smartSearch(filters.searchQuery, result);
    }

    // 2. Filter by Category
    if (filters.category && filters.category !== 'All') {
      result = result.filter(q => q.category.toLowerCase() === filters.category.toLowerCase());
    }

    // 3. Filter by Difficulty
    if (filters.difficulty && filters.difficulty.length > 0) {
      result = result.filter(q => filters.difficulty.includes(q.difficulty));
    }

    // 4. Filter by Duration
    // Duration categories: '<5 min' (<300s), '5–15 min' (300-900s), '>15 min' (>900s)
    if (filters.duration && filters.duration.length > 0) {
      result = result.filter(q => {
        const durSec = q.duration;
        return filters.duration.some(range => {
          if (range === '<5 min') return durSec < 300;
          if (range === '5–15 min') return durSec >= 300 && durSec <= 900;
          if (range === '>15 min') return durSec > 900;
          return true;
        });
      });
    }

    // 5. Apply Sorting
    // Options: 'Newest', 'Popular', 'Highest Rated', 'Easiest First'
    if (filters.sortBy) {
      result.sort((a, b) => {
        if (filters.sortBy === 'Newest') {
          // Fallback to ID comparison if date is not specified
          return b.id.localeCompare(a.id);
        }
        if (filters.sortBy === 'Popular') {
          return (b.takenCount || 0) - (a.takenCount || 0);
        }
        if (filters.sortBy === 'Highest Rated') {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (filters.sortBy === 'Easiest First') {
          const diffWeight = { Easy: 1, Medium: 2, Hard: 3 };
          return (diffWeight[a.difficulty] || 2) - (diffWeight[b.difficulty] || 2);
        }
        return 0;
      });
    }

    return result;
  }, [quizzes, filters]);
}
