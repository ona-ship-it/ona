"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Session } from "@supabase/supabase-js";
import { useTheme } from "@/components/ThemeContext";
import Link from "next/link";
import { ProfileService } from "@/services/profileService";
import type { Database } from "@/types/supabase";

type CommentItem = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export type CommentTargetType = "profile" | "post";

export function Comments({ targetId, targetType }: { targetId: string; targetType: CommentTargetType }) {
  const { isDarker, isWhite } = useTheme();
  const supabase = useMemo(() => createClientComponentClient<Database>({
    cookieOptions: {
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.onagui.com' : undefined,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    }
  }), []);
  const [session, setSession] = useState<Session | null>(null);
  const [canPost, setCanPost] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const storageKey = `comments:${targetType}:${targetId}`;

  useEffect(() => {
    // Load existing comments from localStorage
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
      if (raw) {
        setComments(JSON.parse(raw));
      }
    } catch (err) {
      console.warn("Failed to read comments from localStorage", err);
    }
  }, [storageKey]);

  useEffect(() => {
    // Fetch session and determine if user has a profile (gated posting)
    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (!session) {
          setCanPost(false);
          setLoadingAuth(false);
          return;
        }
        const profileService = new ProfileService();
        const profile = await profileService.getUserProfile(session.user.id);
        setCanPost(!!profile); // Only allow if a profile exists
      } catch (error) {
        console.error("Error checking user profile for comments:", error);
        setCanPost(false);
      } finally {
        setLoadingAuth(false);
      }
    }
    initAuth();
  }, [supabase]);

  function saveComments(updated: CommentItem[]) {
    setComments(updated);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, JSON.stringify(updated));
      }
    } catch (err) {
      console.warn("Failed to persist comments to localStorage", err);
    }
  }

  async function handlePostComment() {
    const content = newComment.trim();
    if (!content) return;
    if (!session) return;
    const authorName = session.user.email || session.user.user_metadata?.full_name || "User";
    const item: CommentItem = {
      id: `${Date.now()}`,
      authorId: session.user.id,
      authorName,
      content,
      createdAt: new Date().toISOString(),
    };
    saveComments([item, ...comments]);
    setNewComment("");
  }

  const cardBase = `${isWhite ? "bg-white border-gray-200" : isDarker ? "bg-[#0c0018] border-gray-800" : "bg-[#2a0044] border-[#3a0055]"}`;
  const textBase = `${isWhite ? "text-gray-900" : "text-white"}`;
  const subText = `${isWhite ? "text-gray-600" : "text-gray-300"}`;

  return (
    <div className={`mt-8 rounded-lg border ${cardBase} shadow-md`}
         aria-label={`${targetType} comments`}>
      <div className={`px-6 py-4 border-b ${isWhite ? "border-gray-200" : "border-gray-700"}`}>
        <h2 className={`text-lg font-medium ${textBase}`}>Community Comments</h2>
        <p className={`text-sm ${subText}`}>{comments.length} comment{comments.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Composer */}
      <div className="p-6">
        {loadingAuth ? (
          <p className={`text-sm ${subText}`}>Checking permissions…</p>
        ) : canPost ? (
          <div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={500}
              placeholder="Share your thoughts…"
              className={`w-full px-3 py-2 rounded-md border ${
                isWhite
                  ? "bg-white text-gray-800 border-gray-300"
                  : isDarker
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-purple-50 text-gray-800 border-purple-300"
              }`}
            />
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-xs ${subText}`}>{newComment.length}/500</span>
              <button
                onClick={handlePostComment}
                disabled={!newComment.trim()}
                className={`px-4 py-2 rounded-md font-medium ${
                  newComment.trim()
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-400 text-white cursor-not-allowed"
                }`}
              >
                Post Comment
              </button>
            </div>
          </div>
        ) : (
          <div className={`text-sm ${subText}`}>
            <p>
              You need a user profile to comment. Please {""}
              <Link href="/account" className="text-purple-500 hover:underline">sign in</Link>{" "}
              or complete your profile.
            </p>
          </div>
        )}
      </div>

      {/* List */}
      <div className="px-6 pb-6 space-y-4">
        {comments.length === 0 ? (
          <p className={`text-sm ${subText}`}>No comments yet. Be the first to share!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className={`rounded-md border p-4 ${cardBase}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`font-semibold ${textBase}`}>{c.authorName}</div>
                <div className={`text-xs ${subText}`}>{new Date(c.createdAt).toLocaleString()}</div>
              </div>
              <p className={`${isWhite ? "text-gray-800" : "text-gray-200"}`}>{c.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Comments;