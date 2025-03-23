import React from 'react';
import { UserSessionService } from '@services/UserSessionService';

const UserSessionBanner = ({ isGuest, timeRemaining, onExtendSession }) => {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="session-banner bg-blue-50 p-4 border-b border-blue-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium text-blue-800">
            {isGuest ? 'Guest Session' : 'Registered Session'}
          </span>
          <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
            {formatTime(timeRemaining)} remaining
          </span>
        </div>
        
        {isGuest && (
          <button
            onClick={onExtendSession}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
          >
            Extend Session
          </button>
        )}
      </div>
    </div>
  );
};

export default UserSessionBanner;