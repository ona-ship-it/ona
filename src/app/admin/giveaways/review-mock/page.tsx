'use client';

import React from 'react';
import GiveawayReviewCard from '@/components/admin/GiveawayReviewCard';

const mockGiveaways = [
  {
    id: 'mock-1',
    title: 'Mock Giveaway A',
    prize_amount: 100,
    temp_winner_id: null,
  },
  {
    id: 'mock-2',
    title: 'Mock Giveaway B',
    prize_amount: 250,
    temp_winner_id: null,
  },
];

export default function ReviewMockPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Review — Mock Cards</h1>
      <p className="text-sm text-muted-foreground">
        This page renders mock giveaways to preview the card layout and audit modal.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockGiveaways.map((g) => (
          <GiveawayReviewCard key={g.id} giveaway={g} refresh={() => {}} />
        ))}
      </div>
    </div>
  );
}