import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VipBadgeProps {
  level?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VipBadge({ level = 'bronze', size = 'md', className }: VipBadgeProps) {
  const sizeClasses = {
    sm: 'text-sm px-2 py-0.5',
    md: 'text-base px-3 py-1',
    lg: 'text-lg px-4 py-1.5'
  };

  const levelClasses = {
    bronze: 'bg-amber-700/20 text-amber-700 border-amber-700/50',
    silver: 'bg-slate-300/20 text-slate-500 border-slate-400/50',
    gold: 'bg-yellow-400/20 text-yellow-600 border-yellow-500/50',
    platinum: 'bg-cyan-400/20 text-cyan-600 border-cyan-500/50',
    diamond: 'bg-indigo-400/20 text-indigo-600 border-indigo-500/50'
  };

  const levelIcons = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    diamond: '👑'
  };

  const descriptions = {
    bronze: 'Bronze VIP Member',
    silver: 'Silver VIP Member',
    gold: 'Gold VIP Member',
    platinum: 'Platinum VIP Member',
    diamond: 'Diamond VIP Member'
  };

  return (
    <TooltipProvider>
      <Tooltip.Root>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              'inline-flex items-center gap-1 rounded-full border',
              sizeClasses[size],
              levelClasses[level],
              className
            )}
          >
            <span>{levelIcons[level]}</span>
            <span className="font-semibold">VIP</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{descriptions[level]}</p>
        </TooltipContent>
      </Tooltip.Root>
    </TooltipProvider>
  );
}

export default VipBadge;