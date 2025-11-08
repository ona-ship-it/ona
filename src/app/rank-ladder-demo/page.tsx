"use client";

import { useState } from 'react';
import PageTitle from '../../components/PageTitle';
import RankLadder from '../../components/RankLadder';
import { useTheme } from '../../lib/ThemeContext';

export default function RankLadderDemo() {
  const { isDarker, isWhite } = useTheme();
  
  return (
    <div className={`min-h-screen ${isWhite ? 'bg-gray-50' : isDarker ? 'bg-[#0a0015]' : 'bg-[#1a0033]'}`}>
      <div className="container mx-auto px-4 py-8">
        <PageTitle>Rank Ladder Demo</PageTitle>
        
        <div className="mt-8">
          <RankLadder ranks={[]} />
        </div>
      </div>
    </div>
  );
}