"use client";

import { signInWithDiscord } from "@/lib/oauth-utils";

export default function DiscordSignIn() {
  const handleDiscordSignIn = async () => {
    try {
      // Get redirectTo parameter from URL if it exists
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirectTo');
      
      const result = await signInWithDiscord(redirectTo || '/');
      
      if (!result.success) {
        console.error("Discord sign-in error:", result.error);
      }
    } catch (error) {
      console.error("Discord sign-in error:", error);
    }
  };

  return (
    <button
      onClick={handleDiscordSignIn}
      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
    >
      Sign in with Discord
    </button>
  );
}