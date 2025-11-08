import React from 'react';
import { UserBadge } from '@/services/profileService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserBadgesProps {
  badges: UserBadge[];
  className?: string;
}

export function UserBadges({ badges, className = '' }: UserBadgesProps) {
  if (!badges || badges.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No badges earned yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Badges ({badges.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <TooltipProvider>
            {badges.map((badge) => (
              <Tooltip.Root key={badge.id}>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-full bg-primary/10">
                    {badge.icon || '🏅'}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{badge.name}</p>
                </TooltipContent>
              </Tooltip.Root>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}