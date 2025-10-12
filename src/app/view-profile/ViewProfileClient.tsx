"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/ThemeContext';
import PageTitle from '@/components/PageTitle';
import Link from 'next/link';
import AchievementBadge from '@/components/AchievementBadge';
import { getUserBadges } from '@/utils/badgeData';
import mockProfiles from '@/utils/mockProfiles';
import Navigation from '@/components/Navigation';
import { ProfileRankSection } from '@/components/ProfileRankSection';

export default function ViewProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [selectedProfile, setSelectedProfile] = useState<keyof typeof mockProfiles | null>(null);
  const { isDarker, isWhite } = useTheme();
  
  // Initialize state on client-side only
  useEffect(() => {
    setSelectedProfile('vipComplete');
    setProfile(mockProfiles.vipComplete);
  }, []);
  
  // Update profile when selection changes
  useEffect(() => {
    if (selectedProfile) {
      setProfile(mockProfiles[selectedProfile]);
    }
  }, [selectedProfile]);

  return (
    <div className={`min-h-screen ${isWhite ? 'bg-gray-50' : isDarker ? 'dark:bg-gray-900 bg-[#0a0015]' : 'dark:bg-gray-900 bg-gradient-to-b from-[#1f2937] to-[#000000] text-white'}`}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <PageTitle>View Profile</PageTitle>
        
        {/* Profile Selector */}
        <div className={`mb-6 p-4 rounded-lg border ${isDarker ? 'bg-gray-800 border-gray-700' : isWhite ? 'bg-white border-gray-200' : 'bg-purple-100 border-purple-300'}`}>
          <h3 className={`text-lg font-bold mb-2 ${isDarker ? 'text-white' : 'text-gray-800'}`}>
            Select Profile to View
          </h3>
          <select
            value={selectedProfile || ''}
            onChange={(e) => setSelectedProfile(e.target.value)}
            className={`px-3 py-2 rounded-md ${
              isDarker 
                ? 'bg-gray-700 text-white border-gray-600' 
                : isWhite 
                  ? 'bg-white text-gray-800 border-gray-300' 
                  : 'bg-gray-50 text-gray-800 border-gray-300'
            }`}
          >
            <option value="vipComplete">VIP (All Badges)</option>
            <option value="activeUser">Active User</option>
            <option value="influencer">Influencer</option>
            <option value="newUser">New User</option>
            <option value="subscriber">Subscriber</option>
          </select>
        </div>
        
        {profile ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Summary Card */}
            <div className={`rounded-lg shadow-md overflow-hidden ${isWhite ? 'bg-white' : isDarker ? 'bg-[#0c0018] border border-gray-800' : 'bg-[#2a0044] border border-[#3a0055]'}`}>
              <div className={`p-6 ${isWhite ? '' : 'border-b border-gray-700'}`}>
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 text-4xl font-bold mb-4">
                    {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'S'}
                  </div>
                  <h2 className={`text-xl font-bold ${isWhite ? 'text-gray-900' : 'text-white'}`}>{profile?.full_name || 'User'}</h2>
                  <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>{profile?.email || ''}</p>
                  <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'} mt-1`}>UID: {profile?.id || ''}</p>
                  
                  <div className="flex mt-4 space-x-2">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      isWhite 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-green-900 bg-opacity-30 text-green-400'
                    }`}>
                      {profile?.userType || 'Regular User'}
                    </span>
                    {profile?.isVerified && (
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        isWhite 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-blue-900 bg-opacity-30 text-blue-400'
                      }`}>
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Account Details */}
            <div className={`rounded-lg shadow-md ${isWhite ? 'bg-white' : isDarker ? 'bg-[#0c0018] border border-gray-800' : 'bg-[#2a0044] border border-[#3a0055]'}`}>
              <div className={`px-6 py-4 border-b ${isWhite ? 'border-gray-200' : 'border-gray-700'}`}>
                <h2 className={`text-lg font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>Account Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Join Date</p>
                  <p className={`font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Username</p>
                  <p className={`font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>@{profile?.username || 'username'}</p>
                </div>
                <div>
                  <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Bio</p>
                  <p className={`font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>{profile?.bio || 'No bio available'}</p>
                </div>
                <div>
                  <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Social</p>
                  <p className={`font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>
                    {profile?.linkX ? (typeof profile.linkX === 'string' ? profile.linkX : 'Connected') : 'Not connected'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats & Achievements */}
            <div className={`rounded-lg shadow-md ${isWhite ? 'bg-white' : isDarker ? 'bg-[#0c0018] border border-gray-800' : 'bg-[#2a0044] border border-[#3a0055]'}`}>
              <div className={`px-6 py-4 border-b ${isWhite ? 'border-gray-200' : 'border-gray-700'}`}>
                <h2 className={`text-lg font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>Stats & Achievements</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${isWhite ? 'text-gray-900' : 'text-white'}`}>{profile?.followers || 0}</p>
                    <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Followers</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${isWhite ? 'text-gray-900' : 'text-white'}`}>{profile?.following || 0}</p>
                    <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Following</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${isWhite ? 'text-gray-900' : 'text-white'}`}>{profile?.referralCount || 0}</p>
                    <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Referrals</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${isWhite ? 'text-gray-900' : 'text-white'}`}>
                      {profile?.balance ? `${profile.balance} ${profile.currency || 'USD'}` : '0 USD'}
                    </p>
                    <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Balance</p>
                  </div>
                </div>
                
                {/* Rank & Achievements */}
                <h3 className={`text-md font-medium mb-3 ${isWhite ? 'text-gray-900' : 'text-white'}`}>Rank & Achievements</h3>
                
                {/* Show ProfileRankSection when using real data, otherwise show mock achievements */}
                {profile?.id && !profile.isMock ? (
                  <ProfileRankSection userId={profile.id} />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile?.completedAchievements && profile.completedAchievements.length > 0 ? (
                      profile.completedAchievements.map((achievement: string) => (
                        <AchievementBadge 
                          key={achievement} 
                          id={achievement}
                          name={`Achievement ${achievement}`}
                          description="Achievement earned"
                          icon="🏆"
                          earned={true}
                        />
                      ))
                    ) : (
                      <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>No achievements yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-8 text-center rounded-lg shadow-md ${isWhite ? 'bg-white' : isDarker ? 'bg-[#0c0018] border border-gray-800' : 'bg-[#2a0044] border border-[#3a0055]'}`}>
            <div className="animate-pulse">
              <div className="h-24 w-24 rounded-full bg-gray-300 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto"></div>
            </div>
            <p className={`mt-4 ${isWhite ? 'text-gray-600' : 'text-gray-400'}`}>Loading profile data...</p>
          </div>
        )}
      </div>
    </div>
  );
}