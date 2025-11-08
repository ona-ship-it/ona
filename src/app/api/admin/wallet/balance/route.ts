import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ensureAdminApiAccess } from "@/lib/supabaseServer";

/**
 * Admin-only endpoint to fetch any user's wallet balance.
 * Requires: Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 * Query param: ?user_id=<uuid>
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("user_id");
  const authHeader = request.headers.get("authorization");
  let hasServiceToken = false;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    hasServiceToken = token === process.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  // Allow session-verified admin access when no service token
  if (!hasServiceToken) {
    const access = await ensureAdminApiAccess();
    if (!access?.isAdmin) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // --- 2️⃣ Validate query param ---
  if (!userId) {
    return NextResponse.json(
      { error: "Missing user_id parameter" },
      { status: 400 }
    );
  }

  // --- 3️⃣ Connect with service role ---
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // --- 4️⃣ Fetch wallet record ---
  const { data, error } = await supabaseAdmin
    .from("wallets")
    .select("id, user_id, balance, updated_at")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Admin Wallet Lookup Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // --- 5️⃣ Return clean JSON response ---
  return NextResponse.json({
    ok: true,
    wallet: data,
  });
}