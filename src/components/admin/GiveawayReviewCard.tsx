"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import type { Database } from "@/types/supabase";

export default function GiveawayReviewCard({ giveaway, refresh }: { giveaway: any; refresh: () => void }) {
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "pick" | "finalize" | "repick") {
    try {
      setLoading(true);

      let rpcName = "";
      let auditAction = "";
      let note = "";

      switch (action) {
        case "pick":
          rpcName = "pick_giveaway_winner";
          auditAction = "draft_winner";
          note = "Admin picked draft winner";
          break;
        case "finalize":
          rpcName = "finalize_giveaway_winner";
          auditAction = "approve_winner";
          note = "Admin finalized winner";
          break;
        case "repick":
          rpcName = "repick_giveaway_winner";
          auditAction = "reject_winner";
          note = "Admin repicked winner";
          break;
      }

      // 1️⃣ Call the Supabase RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc(rpcName as any, {
        giveaway_id: giveaway.id,
      } as any);

      if (rpcError) throw rpcError as any;

      // 2️⃣ Determine accurate target_id from fresh DB state
      let targetId: string | null = null;
      if (action === "finalize") {
        // After finalize, use winner_id (fall back to temp_winner_id if needed)
        const { data: g, error: gErr } = await supabase
          .from("giveaways")
          .select("winner_id, temp_winner_id")
          .eq("id", giveaway.id)
          .single<{ winner_id: string | null; temp_winner_id: string | null }>();
        if (!gErr && g) {
          targetId = g.winner_id ?? g.temp_winner_id ?? (giveaway?.temp_winner_id as string | null) ?? null;
        } else {
          targetId = (giveaway?.temp_winner_id as string | null) ?? null;
        }
      } else {
        // pick/repick returns the new temp winner UUID; fall back to re-fetch
        const rpcTemp = (rpcData as unknown as string | null) ?? null;
        if (rpcTemp) {
          targetId = rpcTemp;
        } else {
          const { data: g, error: gErr } = await supabase
            .from("giveaways")
            .select("temp_winner_id")
            .eq("id", giveaway.id)
            .single<{ temp_winner_id: string | null }>();
          targetId = g?.temp_winner_id ?? (giveaway?.temp_winner_id as string | null) ?? null;
        }
      }

      // 3️⃣ Log the audit entry with proper fields
      const { data: authUser } = await supabase.auth.getUser();
      const { error: auditError } = await supabase.from("giveaway_audit").insert({
        giveaway_id: giveaway.id,
        action: auditAction,
        actor_id: authUser.user?.id ?? null,
        target_id: targetId,
        note,
      } as any);

      if (auditError) console.warn("Audit insert warning:", (auditError as any).message);

      toast.success(`✅ ${note}`);
      refresh();
    } catch (error: any) {
      console.error("Admin giveaway action error:", error?.message || error);
      toast.error(`❌ Failed to ${action} winner: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-2xl p-4 bg-white shadow-md flex flex-col gap-3">
      <h3 className="text-lg font-semibold">{giveaway.title}</h3>
      <p className="text-sm text-gray-500">Ends: {new Date(giveaway.ends_at).toLocaleString()}</p>

      <div className="flex gap-2">
        <button
          onClick={() => handleAction("pick")}
          disabled={loading}
          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Pick Winner
        </button>

        <button
          onClick={() => handleAction("finalize")}
          disabled={loading}
          className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
        >
          Finalize
        </button>

        <button
          onClick={() => handleAction("repick")}
          disabled={loading}
          className="px-3 py-1 rounded bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
        >
          Repick
        </button>
      </div>
    </div>
  );
}