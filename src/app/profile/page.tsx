"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeContext";
import PageTitle from "@/components/PageTitle";
import AchievementBadge from "@/components/AchievementBadge";
import { getAchievementBadge, getUserTypeBadge } from "@/utils/badgeData";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

type SupabaseUser = {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, any> | null;
};

type DbProfile = {
  id: string;
  email?: string | null;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  onagui_type?: string | null;
  created_at?: string | null;
};

export default function ProfilePage() {
  const { theme, isDarker, isWhite } = useTheme();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load profile");
      setUser(data?.user || null);
      setProfile(data?.profile || null);

      try { await fetch('/api/profile/sync', { method: 'POST' }); } catch {}

      const meta = (data?.user?.user_metadata || {}) as Record<string, any>;
      const googleAvatar = meta.picture || meta.avatar_url || meta.picture_url;
      let providerAvatar = data?.profile?.avatar_url || googleAvatar;
      if (providerAvatar && typeof providerAvatar === 'string' && providerAvatar.includes('googleusercontent.com')) {
        providerAvatar = `/api/proxy-image?url=${encodeURIComponent(providerAvatar)}`;
      }
      setAvatarUrl(providerAvatar || '/default-avatar.svg');
    } catch (e) {
      // If unauthorized or error, clear user and profile
      setUser(null);
      setProfile(null);
      setAvatarUrl(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchProfile();

    // Subscribe to auth changes to auto-refresh profile
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile();
      } else {
        setUser(null);
        setProfile(null);
        setAvatarUrl(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // Redirect to login when signed out (once loading completes)
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/signin');
    }
  }, [loading, user, router]);

  // Match card colors to top navbar colors
  const bgCard = isWhite ? "bg-white" : isDarker ? "bg-[#0a0015]" : "bg-[#1a0033]";
  const borderCard = isWhite ? "border-gray-200" : isDarker ? "border-gray-800" : "border-[#2a0044]";
  const textMuted = theme === "dark" || theme === "darker" ? "text-gray-300" : "text-gray-700";

  const displayName =
    profile?.full_name || (user?.user_metadata?.full_name as string) || user?.email || "Your Profile";
  const email = profile?.email || user?.email || "";
  const username =
    profile?.username || (user?.user_metadata?.username as string) || (email ? email.split('@')[0] : "");
  const userType = (profile?.onagui_type || (user?.user_metadata?.userType as string) || "Member").toString();
  const joinedDate = (() => {
    const dateStr = profile?.created_at || user?.created_at;
    if (!dateStr) return "";
    return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC' }).format(new Date(dateStr));
  })();

  // If the user is signed out (or no session), render nothing
  if (!user) {
    // Render nothing while redirecting
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-7xl w-full mx-auto px-4 py-6">
        <PageTitle title="View Profile" />

        {/* 3-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: PFP and quick info */}
          <section className={`rounded-lg ${bgCard} border ${borderCard} p-6`}>
            <div className="flex items-start gap-4">
              <div className={`w-20 h-20 rounded-full ${isWhite ? 'bg-gray-200' : 'bg-[#2a0044]'} flex items-center justify-center overflow-hidden`}>
                <img src={avatarUrl || '/default-avatar.svg'} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{displayName}</h2>
                {email && <p className={textMuted}>{email}</p>}
                <p className={`text-xs ${textMuted}`}>UID: {user?.id || profile?.id || '—'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {getUserTypeBadge(userType) && (
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getUserTypeBadge(userType)!.color}`}>
                      {getUserTypeBadge(userType)!.name}
                    </span>
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
                <p className="text-white">{joinedDate || '—'}</p>
              </div>
              <div>
                <p className={`text-xs ${textMuted}`}>Username</p>
                <p className="text-white">@{username || '—'}</p>
              </div>
              <div>
                <p className={`text-xs ${textMuted}`}>Bio</p>
                <p className="text-white">{profile?.bio || '—'}</p>
              </div>
            </div>
          </section>

          {/* Right: Badges & Achievements (placeholder until real stats available) */}
          <section className={`rounded-lg ${bgCard} border ${borderCard} p-6`}>
            <h3 className={`text-lg font-semibold text-white mb-4`}>Badges</h3>
            <div className={`rounded-lg border ${borderCard} p-4 mb-4`}>
              <div className="flex flex-wrap gap-2">
                {getUserTypeBadge(userType) ? (
                  <AchievementBadge
                    label={getUserTypeBadge(userType)!.name}
                    icon={getUserTypeBadge(userType)!.icon}
                    color={getUserTypeBadge(userType)!.color}
                  />
                ) : (
                  <p className={textMuted}>No badges yet.</p>
                )}
              </div>
            </div>

            <div className={`rounded-lg border ${borderCard} p-4`}>
              <h4 className="text-white font-semibold mb-3">Achievements</h4>
              <div className="flex flex-wrap gap-2">
                {/* Placeholder until backed by real stats */}
                <p className={textMuted}>No achievements unlocked yet.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Optional: silently update avatar/profile in background; no UI when signed out */}
      </main>
    </div>
  );
}