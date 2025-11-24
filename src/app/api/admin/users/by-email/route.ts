import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ensureAdminApiAccess } from "@/lib/supabaseServer";

/**
 * Admin-only endpoint: resolve a user by email.
 * Requires Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 * Query: ?email=<email>
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const authHeader = request.headers.get("authorization");

  // Allow either service token or session-verified admin via middleware
  let hasServiceToken = false;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    hasServiceToken = token === process.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  if (!hasServiceToken) {
    const access = await ensureAdminApiAccess();
    if (!access?.isAdmin) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // Validate query param
  if (!email) {
    return NextResponse.json(
      { error: "Missing email parameter" },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  const service = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  try {
    // Try direct admin lookup; fallback to listUsers if not supported
    const lower = email.toLowerCase();
    let user: { id: string; email: string | null } | null = null;

    const anyService: any = service as any;
    if (anyService?.auth?.admin?.getUserByEmail) {
      const { data, error } = await anyService.auth.admin.getUserByEmail(email);
      if (error) {
        console.warn("getUserByEmail error, falling back to listUsers:", error);
      } else if (data?.user) {
        user = { id: data.user.id, email: data.user.email ?? null };
      }
    }

    if (!user) {
      const { data, error } = await service.auth.admin.listUsers();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      const found = (data?.users || []).find(
        (u: any) => (u.email || "").toLowerCase() === lower
      );
      if (!found) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      user = { id: found.id, email: found.email ?? null };
    }

    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    console.error("Admin users-by-email error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}