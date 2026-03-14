// Badge definitions for user types and achievements (ported and simplified)

export type BadgeKind = 'userType' | 'achievement';

export interface BadgeDef {
  id: string;
  name: string;
  description?: string;
  kind: BadgeKind;
  color: string; // tailwind color class
  icon?: string; // emoji or icon name
}

export const userTypeBadges: BadgeDef[] = [
  { id: 'vip', name: 'VIP', kind: 'userType', color: 'bg-green-700', icon: '⭐' },
  { id: 'active', name: 'Active', kind: 'userType', color: 'bg-blue-700', icon: '⚡' },
  { id: 'influencer', name: 'Influencer', kind: 'userType', color: 'bg-pink-700', icon: '📣' },
  { id: 'subscriber', name: 'Subscriber', kind: 'userType', color: 'bg-indigo-700', icon: '🔔' },
  { id: 'new', name: 'New', kind: 'userType', color: 'bg-gray-700', icon: '✨' },
];

export const achievementBadges: BadgeDef[] = [
  { id: 'first-login', name: 'First Login', kind: 'achievement', color: 'bg-amber-700', icon: '🔑' },
  { id: 'profile-complete', name: 'Profile Complete', kind: 'achievement', color: 'bg-teal-700', icon: '🧩' },
  { id: 'first-ticket', name: 'First Ticket', kind: 'achievement', color: 'bg-purple-700', icon: '🎟️' },
  { id: 'social-connected', name: 'Social Connected', kind: 'achievement', color: 'bg-sky-700', icon: '🌐' },
  { id: 'first-referral', name: 'First Referral', kind: 'achievement', color: 'bg-lime-700', icon: '🫱' },
  { id: 'verified-identity', name: 'Verified', kind: 'achievement', color: 'bg-blue-700', icon: '✅' },
  { id: 'first-purchase', name: 'First Purchase', kind: 'achievement', color: 'bg-rose-700', icon: '🛒' },
];

export function getUserTypeBadge(userType: string | undefined) {
  return userTypeBadges.find((b) => b.id === userType);
}

export function getAchievementBadge(id: string) {
  return achievementBadges.find((b) => b.id === id);
}