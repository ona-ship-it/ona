import React, { useEffect, useState } from 'react';
import { UserRankBadge } from './UserRankBadge';
import { UserAchievements } from './UserAchievements';
import { UserBadges } from './UserBadges';
import { profileService, UserRank, UserAchievement, UserBadge } from '@/services/profileService';

interface ProfileRankSectionProps {
  userId: string;
}

export function ProfileRankSection({ userId }: ProfileRankSectionProps) {
  const [loading, setLoading] = useState(true);
  const [rank, setRank] = useState<UserRank | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);

  useEffect(() => {
    async function loadProfileData() {
      setLoading(true);
      try {
        const [userRank, userAchievements, userBadges] = await Promise.all([
          profileService.getUserRank(userId),
          profileService.getUserAchievements(userId),
          profileService.getUserBadges(userId)
        ]);

        setRank(userRank);
        setAchievements(userAchievements);
        setBadges(userBadges);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadProfileData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rank && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h3 className="text-lg font-semibold mb-2">Current Rank</h3>
          <UserRankBadge rank={rank} size="lg" />
          <p className="mt-2 text-sm text-muted-foreground">{rank.description}</p>
        </div>
      )}

      <UserBadges badges={badges} className="mt-6" />
      
      <UserAchievements achievements={achievements} className="mt-6" />
    </div>
  );
}