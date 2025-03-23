import { useState, useEffect, useCallback } from 'react';
import { SessionService } from '../services/SessionService';
import { encryptData } from '../utils/security';

export const usePathwaySession = ({ timeout, onExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState(timeout);
  const [isExpired, setIsExpired] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState(null);

  const startSession = useCallback((initialState) => {
    // Encrypt session data
    const encryptedState = encryptData(initialState);
    SessionService.startGuestSession(encryptedState);

    // Set up auto-save every 5 minutes
    const interval = setInterval(() => {
      const currentState = SessionService.getGuestSession();
      SessionService.autoSaveGuestProgress(currentState);
    }, 300000);
    setAutoSaveInterval(interval);

    // Start countdown
    let remaining = timeout;
    const timer = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(remaining);
      
      if (remaining <= 300) { // Warn 5 minutes before expiration
        SessionService.autoSaveGuestProgress(SessionService.getGuestSession());
      }

      if (remaining <= 0) {
        clearInterval(timer);
        setIsExpired(true);
        onExpire?.();
        SessionService.clearGuestSession();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(interval);
    };
  }, [timeout, onExpire]);

  const saveGuestProgress = useCallback((progressData) => {
    const encryptedData = encryptData(progressData);
    SessionService.saveGuestSession(encryptedData);
  }, []);

  return {
    timeRemaining: formatTime(timeRemaining),
    isExpired,
    startSession,
    saveGuestProgress,
    clearSession: SessionService.clearGuestSession
  };
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};