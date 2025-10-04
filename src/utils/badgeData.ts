import { BadgeProps } from '../components/AchievementBadge';

// User type badges
export const userTypeBadges: Record<string, BadgeProps> = {
  vip: {
    id: 'user-vip',
    name: 'Onagui VIP',
    description: 'Exclusive member with premium benefits',
    icon: '👑',
    earned: false,
    userType: 'vip'
  },
  active: {
    id: 'user-active',
    name: 'Active User',
    description: 'Uses Onagui tickets to participate regularly',
    icon: '🔥',
    earned: false,
    userType: 'active'
  },
  influencer: {
    id: 'user-influencer',
    name: 'Onagui Empowered',
    description: 'Influencer with growing impact',
    icon: '⭐',
    earned: false,
    userType: 'influencer'
  },
  new: {
    id: 'user-new',
    name: 'New Explorer',
    description: 'Just started the Onagui journey',
    icon: '🌱',
    earned: false,
    userType: 'new'
  },
  subscriber: {
    id: 'user-subscriber',
    name: 'Verified Subscriber',
    description: 'Identity verified and confirmed',
    icon: '✅',
    earned: false,
    userType: 'subscriber'
  }
};

// Achievement badges
export const achievementBadges: BadgeProps[] = [
  {
    id: 'first-login',
    name: 'First Steps',
    description: 'Completed your first login',
    icon: '🚀',
    earned: true
  },
  {
    id: 'profile-complete',
    name: 'Identity Established',
    description: 'Completed your profile information',
    icon: '📝',
    earned: false,
    progress: 3,
    maxProgress: 5
  },
  {
    id: 'first-ticket',
    name: 'Ticket Holder',
    description: 'Purchased your first ticket',
    icon: '🎟️',
    earned: false
  },
  {
    id: 'first-win',
    name: 'Lucky Winner',
    description: 'Won your first giveaway or raffle',
    icon: '🏆',
    earned: false
  },
  {
    id: 'social-share',
    name: 'Social Butterfly',
    description: 'Shared Onagui on social media',
    icon: '🦋',
    earned: false,
    progress: 1,
    maxProgress: 3
  },
  {
    id: 'referral-success',
    name: 'Community Builder',
    description: 'Successfully referred new users',
    icon: '👥',
    earned: false,
    progress: 2,
    maxProgress: 5
  }
];

// Function to get user type badge based on user type
export const getUserTypeBadge = (userType: string): BadgeProps | null => {
  const normalizedType = userType.toLowerCase();
  
  // Map from various possible user type values to our badge keys
  const typeMap: Record<string, string> = {
    'vip': 'vip',
    'onagui vip': 'vip',
    'active': 'active',
    'active user': 'active',
    'influencer': 'influencer',
    'onagui empowered': 'influencer',
    'empowered': 'influencer',
    'new': 'new',
    'new user': 'new',
    'signed-in': 'new',
    'subscriber': 'subscriber',
    'verified': 'subscriber'
  };
  
  const badgeKey = typeMap[normalizedType];
  if (!badgeKey) return null;
  
  const badge = {...userTypeBadges[badgeKey]};
  badge.earned = true; // User type badges are always earned if they match the user's type
  
  return badge;
};

// Function to get all badges for a user
export const getUserBadges = (userType: string, completedAchievements: string[] = []): BadgeProps[] => {
  // Get user type badge
  const userTypeBadge = getUserTypeBadge(userType);
  
  // Process achievement badges, marking earned ones
  const processedAchievementBadges = achievementBadges.map(badge => ({
    ...badge,
    earned: completedAchievements.includes(badge.id)
  }));
  
  // Combine user type badge with achievement badges
  return userTypeBadge ? [userTypeBadge, ...processedAchievementBadges] : processedAchievementBadges;
};