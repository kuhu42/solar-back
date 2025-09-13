import React from 'react';
import { ToggleLeft, ToggleRight, Zap, TestTube } from 'lucide-react';

const ModeToggle = ({ isLiveMode, onToggle, size = 'normal', showLabels = true }) => {
  const sizeClasses = {
    small: 'text-xs',
    normal: 'text-sm',
    large: 'text-base'
  };

  const iconSizes = {
    small: 'w-5 h-5',
    normal: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center space-x-3 p-3 bg-gray-100 rounded-lg ${sizeClasses[size]}`}>
      {showLabels && (
        <div className="flex items-center space-x-1">
          <TestTube className="w-4 h-4 text-blue-600" />
          <span className={`font-medium ${!isLiveMode ? 'text-blue-600' : 'text-gray-500'}`}>
            Demo
          </span>
        </div>
      )}
      
      <button
        onClick={() => onToggle(!isLiveMode)}
        className="relative focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        title={isLiveMode ? 'Switch to Demo Mode' : 'Switch to Live Mode'}
      >
        {isLiveMode ? (
          <ToggleRight className={`${iconSizes[size]} text-green-600 hover:text-green-700 transition-colors`} />
        ) : (
          <ToggleLeft className={`${iconSizes[size]} text-gray-400 hover:text-gray-500 transition-colors`} />
        )}
      </button>
      
      {showLabels && (
        <div className="flex items-center space-x-1">
          <span className={`font-medium ${isLiveMode ? 'text-green-600' : 'text-gray-500'}`}>
            Live
          </span>
          {isLiveMode && <Zap className="w-4 h-4 text-green-600" />}
        </div>
      )}
    </div>
  );
};

export default ModeToggle;