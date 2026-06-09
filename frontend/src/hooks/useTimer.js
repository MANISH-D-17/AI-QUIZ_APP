import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { formatTime } from '../utils/validation';

/**
 * Custom hook to manage quiz countdown timer
 * @param {number} durationSeconds 
 * @param {function} onExpire 
 * @returns {object} { timeLeft, formattedTime, isWarning, isExpired, stopTimer }
 */
export function useTimer(durationSeconds, onExpire) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const onExpireRef = useRef(onExpire);
  const timerRef = useRef(null);

  // Sync expire callback reference
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    setTimeLeft(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      toast.error("Time's up! Submitting...", {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: '#F1F5F9',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }
      });
      if (onExpireRef.current) {
        onExpireRef.current();
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const isWarning = timeLeft <= 30 && timeLeft > 0;
  const isExpired = timeLeft <= 0;
  const formattedTime = formatTime(timeLeft);

  return {
    timeLeft,
    formattedTime,
    isWarning,
    isExpired,
    stopTimer
  };
}
