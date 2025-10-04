import React from 'react';
import { useTheme } from '../lib/ThemeContext';

export interface BadgeProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  userType?: string;
  progress?: number;
  maxProgress?: number;
}

const AchievementBadge: React.FC<BadgeProps> = ({
  name,
  description,
  icon,
  earned,
  progress,
  maxProgress
}) => {
  const { isDarker, isWhite } = useTheme();
  
  // Determine badge styling based on earned status
  const badgeStyle = earned
    ? `${isDarker ? 'bg-gray-800' : isWhite ? 'bg-gray-100' : 'bg-gray-200'} ${isDarker ? 'border-green-700' : 'border-green-500'}`
    : `${isDarker ? 'bg-gray-800' : isWhite ? 'bg-gray-100' : 'bg-gray-200'} ${isDarker ? 'border-gray-700' : 'border-gray-300'} opacity-60`;
  
  // Determine text styling based on earned status and theme
  const textStyle = earned
    ? `${isDarker ? 'text-green-300' : 'text-green-800'}`
    : `${isDarker ? 'text-gray-400' : 'text-gray-500'}`;
  
  // Calculate progress percentage if applicable
  const progressPercentage = progress !== undefined && maxProgress 
    ? Math.min(100, Math.round((progress / maxProgress) * 100))
    : null;

  return (
    <div className={`relative rounded-lg border p-3 transition-all hover:shadow-md ${badgeStyle}`}>
      <div className="flex items-center space-x-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${earned ? 'bg-gradient-to-br from-pink-500 to-green-600' : 'bg-gray-400'}`}>
          <span className="text-xl text-white">{icon}</span>
        </div>
        <div>
          <h3 className={`font-medium ${earned ? (isDarker ? 'text-white' : 'text-gray-900') : (isDarker ? 'text-gray-300' : 'text-gray-600')}`}>
            {name}
          </h3>
          <p className={`text-xs ${textStyle}`}>{description}</p>
          
          {/* Progress bar for badges that track progress */}
          {progressPercentage !== null && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className={textStyle}>{progress} / {maxProgress}</span>
                <span className={textStyle}>{progressPercentage}%</span>
              </div>
              <div className={`h-1.5 w-full rounded-full ${isDarker ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div 
                  className="h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-green-600" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Badge status indicator */}
      {earned && (
        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;