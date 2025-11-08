import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRankBadge } from './UserRankBadge';

// Define a custom UserRank interface for this component
interface UserRank {
  id: string;
  code: string;
  name: string;
  description: string | null;
  level: number;
  requirements: string;
  benefits?: string;
  badge_icon: string | null;
}

interface RankLadderProps {
  ranks: UserRank[];
  currentRankId?: string;
  className?: string;
}

export function RankLadder({ ranks, currentRankId, className = '' }: RankLadderProps) {
  // Sort ranks by their level/order
  const sortedRanks = [...ranks].sort((a, b) => a.level - b.level);
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Rank Ladder</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedRanks.map((rank) => {
            const isCurrentRank = rank.id === currentRankId;
            
            return (
              <div 
                key={rank.id}
                className={`p-3 rounded-lg border ${
                  isCurrentRank 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-card border-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserRankBadge rank={rank} />
                    
                    {isCurrentRank && (
                      <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Level {rank.level}
                  </div>
                </div>
                
                {rank.requirements && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <strong>Requirements:</strong> {typeof rank.requirements === 'string' ? rank.requirements : JSON.stringify(rank.requirements)}
                  </div>
                )}
                
                {rank.benefits && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    <strong>Benefits:</strong> {rank.benefits}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default RankLadder;