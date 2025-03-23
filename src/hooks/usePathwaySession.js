import { useState, useEffect } from 'react';

export default function usePathwaySession({ timeout, onExpire }) {
  const [timeRemaining, setTimeRemaining] = useState(timeout);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return { sessionTimeRemaining: timeRemaining };
}