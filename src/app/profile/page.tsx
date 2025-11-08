"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/ThemeContext";
import Navigation from "@/components/Navigation";
import PageTitle from "@/components/PageTitle";
import AchievementBadge from "@/components/AchievementBadge";
import mockProfiles from "@/utils/mockProfiles";
import { getAchievementBadge, getUserTypeBadge } from "@/utils/badgeData";

type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
};

export default function ProfilePage() {
  const { theme, isDarker, isWhite } = useTheme();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected mock profile to mirror visuals from the screenshot
  const [selectedKey, setSelectedKey] = useState<string>("vipComplete");
  const selected = useMemo(() => mockProfiles[selectedKey], [selectedKey]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setUser(data?.user || null);

        // Fire-and-forget: ensure DB has latest avatar/name/username
        // Non-blocking; if this fails it won't affect UI
        try {
          await fetch('/api/profile/sync', { method: 'POST' });
        } catch {}

        // Prefer Google account avatar from OAuth metadata
        const meta = data?.user?.user_metadata || {};
        const googleAvatar = meta.picture || meta.avatar_url || meta.picture_url;
        let providerAvatar = data?.profile?.avatar_url || googleAvatar;
        // If the avatar is hosted by Google, proxy through our API to avoid ORB issues
        if (providerAvatar && typeof providerAvatar === 'string' && providerAvatar.includes('googleusercontent.com')) {
          providerAvatar = `/api/proxy-image?url=${encodeURIComponent(providerAvatar)}`;
        }
        if (providerAvatar) {
          setAvatarUrl(providerAvatar);
        } else {
          // Final fallback to a local default avatar asset
          setAvatarUrl('/default-avatar.svg');
        }
      } catch (e) {
        // Non-blocking: keep mock visuals even if real profile call fails
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  // Match card colors to top navbar colors
  const bgCard = isWhite ? "bg-white" : isDarker ? "bg-[#0a0015]" : "bg-[#1a0033]";
  const borderCard = isWhite ? "border-gray-200" : isDarker ? "border-gray-800" : "border-[#2a0044]";
  const textMuted = theme === "dark" || theme === "darker" ? "text-gray-300" : "text-gray-700";

  // Use deterministic locale/timezone to avoid SSR/CSR hydration mismatches
  const joinedDate = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC' }).format(
    new Date(selected.created_at)
  );
  const displayName = user?.user_metadata?.full_name || selected.full_name;
  const email = user?.email || selected.email;
  const username = user?.user_metadata?.username || selected.username;
  const verified = Boolean(user?.user_metadata?.verified ?? selected.isVerified);
  const userType = (user?.user_metadata?.userType as string) || selected.userType;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="max-w-7xl w-full mx-auto px-4 py-6">
        <PageTitle title="View Profile" />

        {/* Profile selector */}
        <div className={`mt-4 mb-6 rounded-lg p-4 ${bgCard} border ${borderCard}`}>
          <label className={`block text-sm mb-2 ${textMuted}`}>Select Profile to View</label>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className={`w-full md:w-64 rounded-md bg-purple-800 text-white border ${borderCard} p-2`}
          >
            <option value="vipComplete">VIP (All Badges)</option>
            <option value="activeUser">Active</option>
            <option value="influencer">Influencer</option>
            <option value="subscriber">Subscriber</option>
            <option value="newUser">New</option>
          </select>
        </div>

        {/* 3-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: PFP and quick info */}
          <section className={`rounded-lg ${bgCard} border ${borderCard} p-6`}>
            <div className="flex items-start gap-4">
              <div className={`w-20 h-20 rounded-full ${isWhite ? 'bg-gray-200' : 'bg-[#2a0044]'} flex items-center justify-center overflow-hidden`}>
                {avatarUrl ? (
                  // Live pfp from user profile if available, otherwise mock
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <img src="/default-avatar.svg" alt="avatar" className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{displayName}</h2>
                <p className={textMuted}>{email}</p>
                <p className={`text-xs ${textMuted}`}>UID: {selected.id}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {getUserTypeBadge(userType) && (
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getUserTypeBadge(userType)!.color}`}>
                      {getUserTypeBadge(userType)!.name}
                    </span>
                  )}
                  {verified && (
                    <span className={`px-2 py-1 rounded-full text-xs text-white bg-blue-700`}>Verified</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Middle: Account Details */}
          <section className={`rounded-lg ${bgCard} border ${borderCard} p-6`}>
            <h3 className={`text-lg font-semibold text-white mb-4`}>Account Details</h3>
            <div className="space-y-4">
              <div>
                <p className={`text-xs ${textMuted}`}>Join Date</p>
                <p className="text-white">{joinedDate}</p>
              </div>
              <div>
                <p className={`text-xs ${textMuted}`}>Username</p>
                <p className="text-white">@{username}</p>
              </div>
              <div>
                <p className={`text-xs ${textMuted}`}>Bio</p>
                <p className="text-white">{selected.bio}</p>
              </div>
              <div>
                <p className={`text-xs ${textMuted}`}>Social</p>
                <p className="text-white">{selected.linkX || `@${username}`}</p>
              </div>
            </div>
          </section>

          {/* Right: Stats & Achievements */}
          <section className={`rounded-lg ${bgCard} border ${borderCard} p-6`}>
            <h3 className={`text-lg font-semibold text-white mb-4`}>Stats & Achievements</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatBox label="Followers" value={selected.followers} muted={textMuted} darker={isDarker} white={isWhite} />
              <StatBox label="Following" value={selected.following} muted={textMuted} darker={isDarker} white={isWhite} />
              <StatBox label="Referrals" value={selected.referralCount} muted={textMuted} darker={isDarker} white={isWhite} />
              <StatBox label="Balance" value={`${selected.balance} ${selected.currency}`} muted={textMuted} darker={isDarker} white={isWhite} />
            </div>

            <div className={`rounded-lg border ${borderCard} p-4 mb-4`}>
              <h4 className="text-white font-semibold mb-3">Badges</h4>
              <div className="flex flex-wrap gap-2">
                {getUserTypeBadge(userType) ? (
                  <AchievementBadge
                    label={getUserTypeBadge(userType)!.name}
                    icon={getUserTypeBadge(userType)!.icon}
                    color={getUserTypeBadge(userType)!.color}
                  />
                ) : (
                  <p className={textMuted}>No badges earned yet.</p>
                )}
              </div>
            </div>

            <div className={`rounded-lg border ${borderCard} p-4`}>
              <h4 className="text-white font-semibold mb-3">Achievements</h4>
              <div className="flex flex-wrap gap-2">
                {selected.completedAchievements?.length ? (
                  selected.completedAchievements.map((a) => {
                    const def = getAchievementBadge(a);
                    if (!def) return null;
                    return (
                      <AchievementBadge key={a} label={def.name} icon={def.icon} color={def.color} />
                    );
                  })
                ) : (
                  <p className={textMuted}>No achievements unlocked yet.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Loading overlay for live pfp update */}
        {loading && (
          <div className="fixed bottom-4 right-4 text-xs px-3 py-2 rounded-md bg-purple-800 text-white shadow">
            Updating profile picture...
          </div>
        )}
      </main>
    </div>
  );
}

function StatBox({ label, value, muted, darker, white }: { label: string; value: number | string; muted: string; darker?: boolean; white?: boolean }) {
  return (
    <div className={`rounded-lg ${white ? 'bg-white' : darker ? 'bg-[#0a0015]' : 'bg-[#2a0044]'} p-4`}>
      <p className={`text-xs ${muted}`}>{label}</p>
      <p className={`text-xl font-semibold ${white ? 'text-gray-900' : 'text-white'}`}>{value}</p>
    </div>
  );
}