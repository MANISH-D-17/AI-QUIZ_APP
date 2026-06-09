// Validation and Formatting Helpers for Quiz Platform

/**
 * Checks if a selected answer matches the correct answer
 * Supports numeric indexes or direct string comparisons
 * @param {any} selected 
 * @param {any} correct 
 * @returns {boolean}
 */
export function validateAnswer(selected, correct) {
  if (selected === undefined || selected === null) return false;
  return String(selected).trim().toLowerCase() === String(correct).trim().toLowerCase();
}

/**
 * Formats a duration in seconds into a digital MM:SS string
 * @param {number} totalSeconds 
 * @returns {string} e.g. "05:03" or "23:45"
 */
export function formatTime(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const padMins = String(mins).padStart(2, '0');
  const padSecs = String(secs).padStart(2, '0');
  return `${padMins}:${padSecs}`;
}

/**
 * Converts a standard date string to a beautiful user-friendly presentation view
 * @param {string} dateString e.g. "2026-05-21"
 * @returns {string} e.g. "May 21, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
