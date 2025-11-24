// Mock profiles for testing badge functionality (ported from ona-production)

export interface MockProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  email: string;
  userType: string;
  isVerified: boolean;
  linkX: string;
  balance: number;
  currency: string;
  followers: number;
  following: number;
  referralCode: string;
  referralCount: number;
  completedAchievements: string[];
  created_at: string;
}

// Collection of mock profiles for testing different badge scenarios
export const mockProfiles: Record<string, MockProfile> = {
  // VIP user with all achievements
  vipComplete: {
    id: 'vip-123',
    username: 'vip_member',
    full_name: 'VIP Member',
    avatar_url: 'https://i.pravatar.cc/150?u=vip',
    bio: 'VIP member with exclusive benefits and all achievements unlocked',
    email: 'vip@example.com',
    userType: 'vip',
    isVerified: true,
    linkX: '@vip_member',
    balance: 5000,
    currency: 'USD',
    followers: 1250,
    following: 350,
    referralCode: 'VIP2023',
    referralCount: 25,
    created_at: '2023-01-15T10:30:00Z',
    completedAchievements: [
      'first-login',
      'profile-complete',
      'first-ticket',
      'social-connected',
      'first-referral',
      'verified-identity',
      'first-purchase',
    ],
  },

  // Active user with some achievements
  activeUser: {
    id: 'active-456',
    username: 'active_user',
    full_name: 'Active Participant',
    avatar_url: 'https://i.pravatar.cc/150?u=active',
    bio: 'Regular participant in Onaqui events',
    email: 'active@example.com',
    userType: 'active',
    isVerified: true,
    linkX: '@active_user',
    balance: 750,
    currency: 'USD',
    followers: 120,
    following: 85,
    referralCode: 'ACTIVE2023',
    referralCount: 3,
    created_at: '2023-03-20T14:45:00Z',
    completedAchievements: ['first-login', 'profile-complete', 'first-ticket', 'verified-identity'],
  },

  // Influencer with social focus
  influencer: {
    id: 'influencer-789',
    username: 'influencer',
    full_name: 'Social Influencer',
    avatar_url: 'https://i.pravatar.cc/150?u=influencer',
    bio: 'Growing my influence in the Onaqui community',
    email: 'influencer@example.com',
    userType: 'influencer',
    isVerified: true,
    linkX: '@influencer_official',
    balance: 1200,
    currency: 'USD',
    followers: 5000,
    following: 1200,
    referralCode: 'INFLUENCE',
    referralCount: 15,
    created_at: '2023-05-10T09:15:00Z',
    completedAchievements: ['first-login', 'profile-complete', 'social-connected', 'first-referral'],
  },

  // New user with minimal achievements
  newUser: {
    id: 'new-101',
    username: 'new_member',
    full_name: 'New Member',
    avatar_url: 'https://i.pravatar.cc/150?u=new',
    bio: 'Just joined Onaqui!',
    email: 'new@example.com',
    userType: 'new',
    isVerified: false,
    linkX: '',
    balance: 0,
    currency: 'USD',
    followers: 0,
    following: 5,
    referralCode: 'NEWUSER',
    referralCount: 0,
    created_at: '2023-09-05T16:20:00Z',
    completedAchievements: ['first-login'],
  },

  // Subscriber with verification focus
  subscriber: {
    id: 'subscriber-202',
    username: 'subscriber',
    full_name: 'Verified Subscriber',
    avatar_url: 'https://i.pravatar.cc/150?u=subscriber',
    bio: 'Verified subscriber with a growing profile',
    email: 'subscriber@example.com',
    userType: 'subscriber',
    isVerified: true,
    linkX: '@subscriber',
    balance: 250,
    currency: 'USD',
    followers: 45,
    following: 120,
    referralCode: 'SUBSCRIBE',
    referralCount: 1,
    created_at: '2023-07-12T11:30:00Z',
    completedAchievements: ['first-login', 'verified-identity', 'profile-complete'],
  },
};

// Default export for easy importing
export default mockProfiles;