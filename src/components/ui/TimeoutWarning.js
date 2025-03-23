// src/components/ui/TimeoutWarning.js
import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, RefreshCw, Save } from 'lucide-react';

/**
 * Session timeout warning component that appears when the session is about to expire
 */
const SessionTimeoutWarning = ({ 
  timeoutMinutes = 5, 
  onExtend, 
  onSave,
  onClose
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeoutMinutes * 60); // Convert to seconds
  const [isExtending, setIsExtending] = useState(false);
  
  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  };
  
  // Handle session extension
  const handleExtend = async () => {
    setIsExtending(true);
    try {
      await onExtend();
      onClose();
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setIsExtending(false);
    }
  };
  
  // Get warning level based on time remaining
  const getWarningLevel = () => {
    if (timeRemaining < 60) return 'critical';
    if (timeRemaining < 180) return 'urgent';
    return 'warning';
  };
  
  const warningLevel = getWarningLevel();
  
  // Styling based on warning level
  const styles = {
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      progress: 'bg-yellow-500'
    },
    urgent: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      button: 'bg-orange-600 hover:bg-orange-700 text-white',
      progress: 'bg-orange-500'
    },
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      button: 'bg-red-600 hover:bg-red-700 text-white',
      progress: 'bg-red-500'
    }
  };
  
  const style = styles[warningLevel];
  
  return (
    <div 
      className="fixed bottom-4 right-4 shadow-lg rounded-lg overflow-hidden z-50 w-80 animate-slideUp"
      role="alert"
      aria-live="assertive"
    >
      <div className={`${style.bg} ${style.border} border p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className={`w-5 h-5 ${style.text}`} />
          <h3 className={`font-semibold ${style.text}`}>
            Session Expiring Soon
          </h3>
        </div>
        
        <p className={`text-sm ${style.text} mb-3`}>
          Your session will expire in {formatTime(timeRemaining)}.
          All unsaved progress will be lost.
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleExtend}
            disabled={isExtending}
            className={`
              flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded
              font-medium text-sm transition-colors duration-200
              ${style.button}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isExtending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extending...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Extend Session</span>
              </>
            )}
          </button>
          
          {onSave && (
            <button
              onClick={() => {
                onSave();
                onClose();
              }}
              className="
                px-3 py-2 rounded
                bg-white text-gray-700 text-sm font-medium
                border border-gray-300 hover:bg-gray-50
                transition-colors duration-200
              "
            >
              <Save className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 w-full bg-gray-100 mt-3">
          <div 
            className={`h-full transition-all duration-1000 ${style.progress}`}
            style={{ width: `${(timeRemaining / (timeoutMinutes * 60)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Add animation styles
const styles = `
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out forwards;
}
`;

// Inject styles if in browser environment
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default SessionTimeoutWarning;