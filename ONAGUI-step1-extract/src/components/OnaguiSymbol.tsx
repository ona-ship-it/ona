import React from 'react';

interface OnaguiSymbolProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const OnaguiSymbol: React.FC<OnaguiSymbolProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl'
  };

  return (
    <div className={`font-bold ${sizeClasses[size]} bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 ${className}`}>
      ONA
    </div>
  );
};

export default OnaguiSymbol;