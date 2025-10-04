"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PageTitle from './PageTitle';
import { useTheme } from '../lib/ThemeContext';
import Link from 'next/link';
import Image from 'next/image';
import AchievementBadge from './AchievementBadge';
import { getUserBadges } from '../utils/badgeData';
import mockProfiles from '../utils/mockProfiles';
import { ProfileRankSection } from './ProfileRankSection';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  email?: string;
  userType?: string;
  isVerified?: boolean;
  linkX?: boolean | string;
  balance?: string;
  currency?: string;
  followers?: number;
  following?: number;
  referralCode?: string;
  referralCount?: number;
  completedAchievements?: string[];
}

export default function ProfileClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [incompleteFields, setIncompleteFields] = useState<string[]>([]);
  const [useMockProfile, setUseMockProfile] = useState(false);
  const [selectedMockProfile, setSelectedMockProfile] = useState<keyof typeof mockProfiles>("vipComplete");
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
  });
  
  // User customization preferences
  const [userPreferences, setUserPreferences] = useState({
    accentColor: '#6d28d9', // Default purple
    showAchievements: true,
    compactView: false,
    darkModePreference: 'system', // 'light', 'dark', 'system'
  });
  
  const { isDarker, isWhite } = useTheme();
  const supabase = createClientComponentClient();
  
  // Calculate profile completion percentage
  const calculateProfileCompletion = (profileData: Profile | null) => {
    if (!profileData) return { percentage: 0, incomplete: [] };
    
    const requiredFields = [
      { name: 'Username', value: profileData.username },
      { name: 'Full Name', value: profileData.full_name },
      { name: 'Bio', value: profileData.bio },
      { name: 'Profile Picture', value: profileData.avatar_url },
      { name: 'Email', value: profileData.email },
    ];
    
    const optionalFields = [
      { name: 'Two-Factor Authentication', value: false }, // Assuming not set up yet
      { name: 'Social Links', value: profileData.linkX },
    ];
    
    // Count completed required fields
    const completedRequired = requiredFields.filter(field => 
      field.value && field.value.trim() !== ''
    ).length;
    
    // Count completed optional fields
    const completedOptional = optionalFields.filter(field => field.value).length;
    
    // Calculate percentage (required fields count more than optional)
    const requiredWeight = 0.7;
    const optionalWeight = 0.3;
    
    const requiredPercentage = (completedRequired / requiredFields.length) * requiredWeight * 100;
    const optionalPercentage = (completedOptional / optionalFields.length) * optionalWeight * 100;
    const totalPercentage = Math.round(requiredPercentage + optionalPercentage);
    
    // Get incomplete required fields
    const incompleteFields = requiredFields
      .filter(field => !field.value || field.value.trim() === '')
      .map(field => field.name);
    
    return { percentage: totalPercentage, incomplete: incompleteFields };
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        // ALWAYS use mock profiles for now
        setUseMockProfile(true);
        const mockProfile = mockProfiles[selectedMockProfile];
setProfile({
  ...mockProfile,
  balance: String(mockProfile.balance)
});
        setFormData({
          username: mockProfile.username || '',
          full_name: mockProfile.full_name || '',
          bio: mockProfile.bio || '',
        });
        
        // Calculate profile completion
        const { percentage, incomplete } = calculateProfileCompletion(mockProfile);
        setCompletionPercentage(percentage);
        setIncompleteFields(incomplete);
        setLoading(false);
        return;
        
        // The authentication code below is commented out to always use mock profiles
        /*
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            console.log('No authenticated user found, using mock profile');
            // If not authenticated, default to mock profile for testing
            setUseMockProfile(true);
            const mockProfile = mockProfiles[selectedMockProfile];
            setProfile(mockProfile);
            setFormData({
              username: mockProfile.username || '',
              full_name: mockProfile.full_name || '',
              bio: mockProfile.bio || '',
            });
            
            // Calculate profile completion
            const { percentage, incomplete } = calculateProfileCompletion(mockProfile);
            setCompletionPercentage(percentage);
            setIncompleteFields(incomplete);
            setLoading(false);
            return;
          }
        */
          
          /* This code is commented out to always use mock profiles
          console.log('Fetching profile for user:', user.id);
          // First check if the user exists in our profiles table
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.log('Error fetching profile, checking for mock profiles in database');
            // Try to fetch one of our mock profiles from the database
            const { data: mockData, error: mockError } = await supabase
              .from('profiles')
              .select('*')
              .eq('username', 'vipuser')
              .single();
          */
              
            /* All this code is commented out to always use mock profiles
            if (mockError) {
              console.log('No mock profiles found in database, using local mock profile');
              throw mockError;
            }
            
            console.log('Found mock profile in database:', mockData);
            setProfile(mockData);
            setFormData({
              username: mockData.username || '',
              full_name: mockData.full_name || '',
              bio: mockData.bio || '',
            });
            
            // Calculate profile completion
            const { percentage, incomplete } = calculateProfileCompletion(mockData);
            setCompletionPercentage(percentage);
            setIncompleteFields(incomplete);
            setLoading(false);
            return;
          }
          
          console.log('Profile found:', data);
          setProfile(data);
          setFormData({
            username: data.username || '',
            full_name: data.full_name || '',
            bio: data.bio || '',
          });
          
          // Calculate profile completion
          const { percentage, incomplete } = calculateProfileCompletion(data);
          setCompletionPercentage(percentage);
          setIncompleteFields(incomplete);
        } catch (authError) {
          console.error('Authentication error:', authError);
          // Default to mock profile if authentication fails
          setUseMockProfile(true);
          const mockProfile = mockProfiles[selectedMockProfile];
          setProfile(mockProfile);
          setFormData({
            username: mockProfile.username || '',
            full_name: mockProfile.full_name || '',
            bio: mockProfile.bio || '',
          });
          
          // Calculate profile completion
          const { percentage, incomplete } = calculateProfileCompletion(mockProfile);
          setCompletionPercentage(percentage);
          setIncompleteFields(incomplete);
        }
        */
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [selectedMockProfile]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // In a real app, we would upload to storage
    // For demo purposes, create a local URL
    const objectUrl = URL.createObjectURL(file);
    
    if (profile) {
      setProfile({
        ...profile,
        avatar_url: objectUrl
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (useMockProfile) {
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update the mock profile
        const updatedProfile = {
          ...profile!,
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          userPreferences: userPreferences
        };
        
        setProfile(updatedProfile);
        
        // Calculate profile completion
        const { percentage, incomplete } = calculateProfileCompletion(updatedProfile);
        setCompletionPercentage(percentage);
        setIncompleteFields(incomplete);
        
        setEditing(false);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Refresh profile data
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      setProfile(data);
      setEditing(false);
      
      // Calculate profile completion
      const { percentage, incomplete } = calculateProfileCompletion(data);
      setCompletionPercentage(percentage);
      setIncompleteFields(incomplete);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageTitle>Profile</PageTitle>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen ${isWhite ? 'bg-gray-50' : isDarker ? 'bg-gray-900' : 'bg-gray-800'}`}>
      <div className="container mx-auto px-4 py-8">
        <PageTitle>My Profile</PageTitle>
        
        {/* Mock Profile Controls - For Testing Only - MOVED TO TOP FOR VISIBILITY */}
        <div className={`mb-6 p-4 rounded-lg border ${isDarker ? 'bg-gray-800 border-gray-700' : isWhite ? 'bg-white border-gray-200' : 'bg-purple-100 border-purple-300'}`} style={{border: '2px solid #ff6b6b'}}>
          <h3 className={`text-lg font-bold mb-2 ${isDarker ? 'text-white' : 'text-gray-800'}`}>
            🧪 Mock Profile Testing
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useMockProfile"
                checked={useMockProfile}
                onChange={() => setUseMockProfile(!useMockProfile)}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor="useMockProfile" className={`font-medium ${isDarker ? 'text-white' : 'text-gray-800'}`}>
                Use Mock Profile (Testing Only)
              </label>
            </div>
            
            <select
              value={selectedMockProfile}
              onChange={(e) => setSelectedMockProfile(e.target.value as string)}
              className={`px-3 py-2 rounded-md ${
                isDarker 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : isWhite 
                    ? 'bg-white text-gray-800 border-gray-300' 
                    : 'bg-gray-50 text-gray-800 border-gray-300'
              }`}
              disabled={!useMockProfile}
            >
              <option value="vipComplete">VIP (All Badges)</option>
              <option value="activeUser">Active User</option>
              <option value="influencer">Influencer</option>
              <option value="newUser">New User</option>
              <option value="subscriber">Subscriber</option>
            </select>
          </div>
          <p className={`mt-2 text-xs ${isDarker ? 'text-gray-400' : 'text-gray-500'}`}>
            These mock profiles are for testing badge functionality and will be removed in production.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <div className={`rounded-lg shadow-md overflow-hidden ${isWhite ? 'bg-white' : isDarker ? 'bg-gray-800 border border-gray-700' : 'bg-gray-700 border border-gray-600'}`}>
            <div className={`p-6 ${isWhite ? '' : 'border-b border-gray-700'}`}>
              <div className="flex flex-col items-center">
                {profile?.avatar_url ? (
                  <div className="h-24 w-24 rounded-full overflow-hidden mb-4">
                    <Image 
                      src={profile.avatar_url}
                      alt={`${profile.full_name || profile.username || 'User'}'s avatar`}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                      priority
                      loading="eager"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 text-4xl font-bold mb-4">
                    {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'S'}
                  </div>
                )}
                <h2 className={`text-xl font-bold ${isWhite ? 'text-gray-900' : 'text-white'}`}>{profile?.full_name || 'Sapphire'}</h2>
                <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>{profile?.email || ''}</p>
                <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'} mt-1`}>UID: {profile?.id || '32356361'}</p>
                
                {/* User Type Badges */}
                <div className="flex mt-4 space-x-2">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    isWhite 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-green-900 bg-opacity-30 text-green-400'
                  }`}>
                    {profile?.userType || 'Regular User'}
                  </span>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    isWhite 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-blue-900 bg-opacity-30 text-blue-400'
                  }`}>
                    {profile?.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    isWhite 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-gray-800 text-gray-300'
                  }`}>
                    {profile?.linkX ? 'X Linked' : 'Link X'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <div className="text-center">
                  <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Following</p>
                  <p className={`text-xl font-bold ${isWhite ? 'text-gray-900' : 'text-white'}`}>0</p>
                </div>
                <div className="text-center">
                  <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Followers</p>
                  <p className={`text-xl font-bold ${isWhite ? 'text-gray-900' : 'text-white'}`}>0</p>
                </div>
              </div>
            </div>
            
            <div className={`px-6 py-4 ${isWhite ? 'bg-gray-50' : 'bg-opacity-30'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Estimated Balance</p>
                  <p className={`text-xl font-bold ${isWhite ? 'text-gray-900' : 'text-white'}`}>
                    0.47323952 <span className="text-sm">USDT</span>
                  </p>
                </div>
                <Link href="/wallet" className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isWhite 
                    ? 'bg-pink-600 text-white hover:bg-pink-700' 
                    : 'bg-green-700 text-white hover:bg-green-600'
                } transition-colors`}>
                  View Wallet
                </Link>
              </div>
            </div>
          </div>
          
          {/* Account Details */}
          <div className={`rounded-lg shadow-md ${isWhite ? 'bg-white' : isDarker ? 'bg-gray-800 border border-gray-700' : 'bg-gray-700 border border-gray-600'}`}>
            <div className={`px-6 py-4 border-b ${isWhite ? 'border-gray-200' : 'border-gray-700'}`}>
              <h2 className={`text-lg font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>Account Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Join Date</p>
                <p className={`font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '2023-05-15'}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Last Login</p>
                <p className={`font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Username</p>
                <p className={`font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>
                  @{profile?.username || 'sapphire'}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Bio</p>
                <p className={`font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>
                  {profile?.bio || 'No bio provided'}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Two-Factor Authentication</p>
                <p className={`font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>
                  Disabled
                </p>
              </div>
              <div>
                <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Security Level</p>
                <p className={`font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>Medium</p>
              </div>
              <div>
                <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>KYC Status</p>
                <p className={`font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>Verified</p>
              </div>
            </div>
          </div>
          
          {/* Achievement Badges */}
          <div className={`mt-6 rounded-lg shadow-md ${isWhite ? 'bg-white' : isDarker ? 'bg-[#0c0018] border border-gray-800' : 'bg-[#2a0044] border border-[#3a0055]'}`}>
            <div className={`px-6 py-4 border-b ${isWhite ? 'border-gray-200' : 'border-gray-700'}`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-lg font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>Achievement Badges</h2>
                <span className={`text-sm px-2 py-1 rounded-full ${isWhite ? 'bg-purple-100 text-purple-800' : 'bg-purple-900 bg-opacity-30 text-purple-300'}`}>
                  {getUserBadges(profile?.userType || 'new', profile?.completedAchievements || ['first-login']).filter(badge => badge.earned).length} Earned
                </span>
              </div>
            </div>
            <div className="p-6">
              {!useMockProfile && profile?.id ? (
                <ProfileRankSection userId={profile.id} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getUserBadges(profile?.userType || 'new', profile?.completedAchievements || ['first-login']).map((badge) => (
                    <AchievementBadge 
                      key={badge.id}
                      id={badge.id}
                      name={badge.name}
                      description={badge.description}
                      icon={badge.icon}
                      earned={badge.earned}
                      progress={badge.progress}
                      maxProgress={badge.maxProgress}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Notification Settings & Referrals */}
          <div className="space-y-6">
            <div className={`rounded-lg shadow-md ${isWhite ? 'bg-white' : isDarker ? 'bg-gray-800 border border-gray-700' : 'bg-gray-700 border border-gray-600'}`}>
              <div className={`px-6 py-4 border-b ${isWhite ? 'border-gray-200' : 'border-gray-700'}`}>
                <h2 className={`text-lg font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>Notification Settings</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <p className={`${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>Email Notifications</p>
                  <div className={`w-12 h-6 rounded-full bg-green-500 relative`}>
                    <div className={`absolute w-4 h-4 rounded-full bg-white top-1 right-1 transition-all`}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>Push Notifications</p>
                  <div className={`w-12 h-6 rounded-full ${isWhite ? 'bg-gray-300' : 'bg-gray-700'} relative`}>
                    <div className={`absolute w-4 h-4 rounded-full bg-white top-1 left-1 transition-all`}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>SMS Notifications</p>
                  <div className={`w-12 h-6 rounded-full ${isWhite ? 'bg-gray-300' : 'bg-gray-700'} relative`}>
                    <div className={`absolute w-4 h-4 rounded-full bg-white top-1 left-1 transition-all`}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`rounded-lg shadow-md ${isWhite ? 'bg-white' : isDarker ? 'bg-gray-800 border border-gray-700' : 'bg-gray-700 border border-gray-600'}`}>
              <div className={`px-6 py-4 border-b ${isWhite ? 'border-gray-200' : 'border-gray-700'}`}>
                <h2 className={`text-lg font-medium ${isWhite ? 'text-gray-900' : 'text-white'}`}>Referrals</h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Your Referral Code</p>
                  <div className="flex mt-1">
                    <input 
                      type="text" 
                      value="SAPP123" 
                      readOnly 
                      className={`flex-1 px-3 py-2 rounded-l-md ${
                        isWhite 
                          ? 'bg-gray-100 text-gray-800 border border-gray-300' 
                          : 'bg-gray-800 text-gray-200 border border-gray-700'
                      }`}
                    />
                    <button className={`px-3 py-2 rounded-r-md ${
                      isWhite 
                        ? 'bg-onaguiGreen text-white hover:bg-onaguiGreen-dark' 
                        : 'bg-purple-700 text-white hover:bg-onaguiGreen'
                    }`}>
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <p className={`text-sm ${isWhite ? 'text-gray-500' : 'text-gray-400'}`}>Total Referrals</p>
                  <p className={`text-xl font-bold ${isWhite ? 'text-gray-900' : 'text-white'}`}>5</p>
                </div>
                <div className="mt-4">
                  <Link href="/referral" className={`block w-full text-center px-4 py-2 rounded-md text-sm font-medium ${
                    isWhite 
                      ? 'bg-onaguiGreen text-white hover:bg-onaguiGreen-dark' 
                      : 'bg-purple-700 text-white hover:bg-onaguiGreen'
                  } transition-colors`}>
                    View Referral Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={() => setEditing(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isWhite 
                ? 'bg-onaguiGreen text-white hover:bg-onaguiGreen-dark' 
                : 'bg-purple-700 text-white hover:bg-onaguiGreen'
            } transition-colors`}
          >
            Edit Profile
          </button>
          <Link href="/settings/security" className={`px-4 py-2 rounded-md text-sm font-medium ${
            isWhite 
              ? 'bg-gray-600 text-white hover:bg-gray-700' 
              : 'bg-gray-700 text-white hover:bg-gray-600'
          } transition-colors`}>
            Security Settings
          </Link>
          <Link href="/settings/privacy" className={`px-4 py-2 rounded-md text-sm font-medium ${
            isWhite 
              ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' 
              : 'border border-gray-700 text-gray-300 hover:bg-gray-800'
          } transition-colors`}>
            Privacy Settings
          </Link>
        </div>
      </div>
    </div>
    
    {editing && (
          <div className={`mt-8 rounded-lg shadow-md p-6 ${isWhite ? 'bg-white' : isDarker ? 'bg-[#0c0018] border border-gray-800' : 'bg-[#2a0044] border border-[#3a0055]'}`}>
            <h2 className={`text-lg font-medium mb-4 ${isWhite ? 'text-gray-900' : 'text-white'}`}>Edit Profile</h2>
            
            {/* Profile Completion Indicator */}
            <div className="w-full mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-medium ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                  Profile Completion
                </span>
                <span className={`text-sm font-medium ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                  {completionPercentage}%
                </span>
              </div>
              <div className={`w-full ${isWhite ? 'bg-gray-200' : 'bg-gray-700'} rounded-full h-2.5`}>
                <div 
                  className={`h-2.5 rounded-full ${completionPercentage < 30 ? 'bg-red-600' : completionPercentage < 70 ? 'bg-yellow-400' : 'bg-green-600'}`} 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              
              {incompleteFields.length > 0 && (
                <div className="mt-2">
                  <p className={`text-xs ${isWhite ? 'text-gray-600' : 'text-gray-400'}`}>
                    Complete these fields to improve your profile: {incompleteFields.join(', ')}
                  </p>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label htmlFor="username" className={`block text-sm font-medium ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${isWhite ? 'border-gray-300 focus:border-onaguiGreen focus:ring-onaguiGreen' : 'bg-gray-700 border-gray-600 text-white focus:border-onaguiGreen-light focus:ring-purple-400'}`}
                />
              </div>
              
              <div>
                <label htmlFor="full_name" className={`block text-sm font-medium ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${isWhite ? 'border-gray-300 focus:border-onaguiGreen focus:ring-onaguiGreen' : 'bg-gray-700 border-gray-600 text-white focus:border-onaguiGreen-light focus:ring-purple-400'}`}
                />
              </div>
              
              <div>
                <label htmlFor="bio" className={`block text-sm font-medium ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${isWhite ? 'border-gray-300 focus:border-onaguiGreen focus:ring-onaguiGreen' : 'bg-gray-700 border-gray-600 text-white focus:border-onaguiGreen-light focus:ring-purple-400'}`}
                />
              </div>
              
              {/* Profile Picture Upload */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 overflow-hidden rounded-full bg-gray-100">
                    {profile && profile.avatar_url ? (
                      <Image 
                        src={profile.avatar_url} 
                        alt="Profile picture" 
                        width={80} 
                        height={80} 
                        className="object-cover w-full h-full"
                        priority
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-xl font-medium ${isWhite ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-white'}`}>
{profile && profile.full_name ? profile.full_name.charAt(0) : '?'}
                      </div>
                    )}
                  </div>
                  <label className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium ${
                    isWhite 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  } transition-colors`}>
                    Upload New Picture
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleProfilePictureUpload}
                    />
                  </label>
                </div>
              </div>
              
              {/* Social Media Links */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                  Social Media Links
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 rounded-l-md border ${
                      isWhite 
                        ? 'border-r-0 border-gray-300 bg-gray-50 text-gray-500' 
                        : 'border-r-0 border-gray-700 bg-gray-800 text-gray-400'
                    }`}>
                      X
                    </span>
                    <input
                      type="text"
                      placeholder="Your X username"
                      className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md sm:text-sm ${
                        isWhite 
                          ? 'border-gray-300 focus:border-onaguiGreen focus:ring-onaguiGreen' 
                          : 'bg-gray-800 border-gray-700 text-white focus:border-onaguiGreen-light focus:ring-purple-400'
                      }`}
                    />
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 rounded-l-md border ${
                      isWhite 
                        ? 'border-r-0 border-gray-300 bg-gray-50 text-gray-500' 
                        : 'border-r-0 border-gray-700 bg-gray-800 text-gray-400'
                    }`}>
                      Discord
                    </span>
                    <input
                      type="text"
                      placeholder="Your Discord username"
                      className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md sm:text-sm ${
                        isWhite 
                          ? 'border-gray-300 focus:border-onaguiGreen focus:ring-onaguiGreen' 
                          : 'bg-gray-800 border-gray-700 text-white focus:border-onaguiGreen-light focus:ring-purple-400'
                      }`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Profile Customization Options */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className={`text-lg font-medium mb-4 ${isWhite ? 'text-gray-900' : 'text-white'}`}>
                  Profile Customization
                </h3>
                
                {/* Accent Color Selection */}
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                    Accent Color
                  </label>
                  <div className="flex space-x-2">
                    {['#6d28d9', '#2563eb', '#dc2626', '#16a34a', '#ea580c', '#0891b2'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setUserPreferences({...userPreferences, accentColor: color})}
                        className={`w-8 h-8 rounded-full ${userPreferences.accentColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select ${color} as accent color`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Display Preferences */}
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                    Display Preferences
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="showAchievements"
                        type="checkbox"
                        checked={userPreferences.showAchievements}
                        onChange={() => setUserPreferences({...userPreferences, showAchievements: !userPreferences.showAchievements})}
                        className="h-4 w-4 text-onaguiGreen focus:ring-onaguiGreen border-gray-300 rounded"
                      />
                      <label htmlFor="showAchievements" className={`ml-2 block text-sm ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                        Show achievements on profile
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="compactView"
                        type="checkbox"
                        checked={userPreferences.compactView}
                        onChange={() => setUserPreferences({...userPreferences, compactView: !userPreferences.compactView})}
                        className="h-4 w-4 text-onaguiGreen focus:ring-onaguiGreen border-gray-300 rounded"
                      />
                      <label htmlFor="compactView" className={`ml-2 block text-sm ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                        Use compact view
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Theme Preference */}
                <div className="mb-4">
                  <label htmlFor="themePreference" className={`block text-sm font-medium mb-2 ${isWhite ? 'text-gray-700' : 'text-gray-300'}`}>
                    Theme Preference
                  </label>
                  <select
                    id="themePreference"
                    value={userPreferences.darkModePreference}
                    onChange={(e) => setUserPreferences({...userPreferences, darkModePreference: e.target.value})}
                    className={`block w-full rounded-md ${isWhite ? 'border-gray-300 focus:border-onaguiGreen focus:ring-onaguiGreen' : 'bg-gray-700 border-gray-600 text-white focus:border-onaguiGreen-light focus:ring-purple-400'}`}
                  >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                    <option value="system">Follow System</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${isWhite ? 'bg-onaguiGreen text-white hover:bg-onaguiGreen-dark' : 'bg-purple-700 text-white hover:bg-onaguiGreen'} transition-colors disabled:opacity-50`}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${isWhite ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' : 'border border-gray-700 text-gray-300 hover:bg-gray-800'} transition-colors`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
