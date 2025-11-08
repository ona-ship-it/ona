import React from 'react';
import { UserRank } from '@/services/profileService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserRankBadgeProps {
  rank: UserRank;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export function UserRankBadge({ rank, size = 'md', showName = true }: UserRankBadgeProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <TooltipProvider>
      <Tooltip.Root>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <span className={`${sizeClasses[size]}`}>{rank.badge_icon}</span>
            {showName && (
              <span className="font-medium">{rank.name}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{rank.description || rank.name}</p>
        </TooltipContent>
      </Tooltip.Root>
    </TooltipProvider>
  );
}