"use client";

import { useState } from "react";

export default function AdminWalletPage() {
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchBalance() {
    setError("");
    setWallet(null);
    setLoading(true);

    try {
      // 1️⃣ Resolve user_id from email via Admin API
      const bearer = process.env.NEXT_PUBLIC_ADMIN_BEARER;
      const userHeaders: Record<string, string> = {};
      if (bearer) {
        userHeaders["Authorization"] = `Bearer ${bearer}`;
      }
      const resUser = await fetch(`/api/admin/users/by-email?email=${encodeURIComponent(email)}`, {
        headers: userHeaders,
      });
      const userData = await resUser.json();
      if (!resUser.ok) throw new Error(userData.error || "User not found");
      const userId = userData.user?.id;
      if (!userId) throw new Error("No user_id found for this email");

      // 2️⃣ Fetch wallet balance for the resolved user_id
      const walletHeaders: Record<string, string> = {};
      if (bearer) {
        walletHeaders["Authorization"] = `Bearer ${bearer}`;
      }
      const resWallet = await fetch(`/api/admin/wallet/balance?user_id=${userId}`, {
        headers: walletHeaders,
      });
      const walletData = await resWallet.json();
      if (!resWallet.ok) throw new Error(walletData.error || "Wallet not found");
      setWallet(walletData.wallet);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🔐 Admin Wallet Lookup</h1>

      <div className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter user email"
          className="p-2 border rounded"
        />

        <button
          onClick={fetchBalance}
          disabled={loading || !email}
          className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Fetching..." : "Fetch Balance"}
        </button>

        {error && <p className="text-red-500 mt-3">{error}</p>}

        {wallet && (
          <div className="bg-gray-100 rounded p-4 mt-4">
            <p><strong>User ID:</strong> {wallet.user_id}</p>
            <p><strong>Wallet ID:</strong> {wallet.id}</p>
            <p><strong>Balance:</strong> {wallet.balance}</p>
            <p><strong>Last Updated:</strong> {new Date(wallet.updated_at).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}