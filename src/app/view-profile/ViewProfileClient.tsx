"use client";

import { useEffect, useState } from "react";
import AchievementBadge from "@/components/AchievementBadge";
import { getAchievementBadge, getUserTypeBadge } from "@/utils/badgeData";

type SupabaseUser = {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown> | null;
};

export default function ViewProfileClient() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [userType, setUserType] = useState<string | undefined>(undefined);
  const [completedAchievements, setCompletedAchievements] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          if (!res.ok) {
            setError(data?.error || "Unable to load profile");
            setLoading(false);
            return;
          }
          const u: SupabaseUser = data.user;
          setUser(u);
          // Prefill from metadata if present
          const meta = (u?.user_metadata || {}) as Record<string, unknown>;
          const preName = typeof meta["full_name"] === "string" ? (meta["full_name"] as string) : "";
          const preBio = typeof meta["bio"] === "string" ? (meta["bio"] as string) : "";
          setDisplayName(preName);
          setBio(preBio);
          // Derive badges data from metadata when available
          const inferredType = (meta["onagui_type"] as string) || (meta["userType"] as string) || undefined;
          setUserType(inferredType);
          const achievements = Array.isArray(meta["completedAchievements"]) ? (meta["completedAchievements"] as string[]) : [];
          setCompletedAchievements(achievements);
          // Try to extract a provider avatar URL from common metadata keys
          const avatarKeys = ["avatar_url", "picture", "profile_image_url", "image", "image_url", "photo"];
          let found: string | null = null;
          for (const k of avatarKeys) {
            const v = meta[k];
            if (typeof v === "string" && v.trim().length > 0) {
              found = v;
              break;
            }
          }
          setAvatarUrl(found);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError("Network error loading profile");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = (name?: string | null, email?: string | null) => {
    const src = (name || email || "") as string;
    const parts = src.trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second || first || "?").toUpperCase();
  };

  const primaryName = () => {
    const fullName = (user?.user_metadata?.["full_name"] as string) || "";
    return fullName || user?.email || "Your Profile";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 px-6 py-8 md:px-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Profile</h1>

      {loading && (
        <div className="animate-pulse">
          <div className="h-6 w-40 bg-gray-700 rounded mb-4" />
          <div className="h-40 bg-gray-800 rounded" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-gray-800 border border-gray-600 text-gray-200 rounded p-4 mb-6">
          <p className="font-medium">Unable to load your profile</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile summary */}
          <div className="md:col-span-1 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-4">
              {avatarUrl && !avatarFailed ? (
                <img
                  src={avatarUrl}
                  alt={primaryName()}
                  onError={() => setAvatarFailed(true)}
                  className="w-16 h-16 rounded-full object-cover border border-gray-700"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-gray-2 00 font-semibold text-xl">
                  {initials(primaryName(), user?.email)}
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-100">{primaryName()}</h2>
                {user?.email && (
                  <p className="text-sm">
                    <a
                      href={`mailto:${user.email}`}
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    >
                      {user.email}
                    </a>
                  </p>
                )}
                {avatarUrl && (
                  <p className="text-gray-500 text-xs">Photo from your sign‑in provider</p>
                )}
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between"><span className="text-gray-400">User ID</span><span className="font-mono">{user?.id}</span></div>
              {user?.created_at && (
                <div className="flex justify-between"><span className="text-gray-400">Joined</span><span>{new Date(user.created_at).toLocaleDateString()}</span></div>
              )}
            </div>
          </div>

          {/* Edit form */}
          <div className="md:col-span-2 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-2 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                  placeholder="Enter your display name"
                />
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2 bg-gray-900 text-gray-100 border border-gray-700 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-gray-100 px-5 py-2 rounded-lg disabled:opacity-60"
                  disabled
                  title="Saving will be enabled once the profile update endpoint is wired up"
                >
                  Save Changes
                </button>
                <span className="text-gray-400 text-sm">Read-only for now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges & Achievements */}
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Badges</h3>
            <div className="rounded-lg border border-gray-700 p-4 mb-4">
              <div className="flex flex-wrap gap-2">
                {getUserTypeBadge(userType) ? (
                  <AchievementBadge
                    label={getUserTypeBadge(userType)!.name}
                    icon={getUserTypeBadge(userType)!.icon}
                    color={getUserTypeBadge(userType)!.color}
                  />
                ) : (
                  <p className="text-gray-400">No badges yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
            <div className="rounded-lg border border-gray-700 p-4">
              <div className="flex flex-wrap gap-2">
                {completedAchievements.length > 0 ? (
                  completedAchievements
                    .map((id) => getAchievementBadge(id))
                    .filter(Boolean)
                    .map((def) => (
                      <AchievementBadge key={def!.id} label={def!.name} icon={def!.icon} color={def!.color} />
                    ))
                ) : (
                  <p className="text-gray-400">No achievements unlocked yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}