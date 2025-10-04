"use client";

import { useState } from 'react';
import PageTitle from '../../components/PageTitle';
import VipBadge from '../../components/VipBadge';
import { useTheme } from '../../lib/ThemeContext';

export default function VipDemo() {
  const { isDarker, isWhite } = useTheme();
  
  return (
    <div className={`min-h-screen ${isWhite ? 'bg-gray-50' : isDarker ? 'bg-[#0a0015]' : 'bg-[#1a0033]'}`}>
      <div className="container mx-auto px-4 py-8">
        <PageTitle>VIP Badge Demo</PageTitle>
        
        <div className="mt-8 flex justify-center">
          <VipBadge level="gold" />
        </div>
      </div>
    </div>
  );
}