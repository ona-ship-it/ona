import React from 'react';
import Image from 'next/image';
import { UserAchievement } from '@/services/profileService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserAchievementsProps {
  achievements: UserAchievement[];
  className?: string;
}

export function UserAchievements({ achievements, className = '' }: UserAchievementsProps) {
  if (!achievements || achievements.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No achievements unlocked yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Achievements ({achievements.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
              {achievement.icon_url ? (
                <Image 
                  src={achievement.icon_url} 
                  alt={achievement.name} 
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  priority={false}
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                  🏆
                </div>
              )}
              <div>
                <h4 className="font-medium">{achievement.name}</h4>
                {achievement.description && (
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                )}
                <div className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium">{achievement.points} points</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}