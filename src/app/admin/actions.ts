"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export interface AdminUserWithRole {
  id: string;
  email: string;
  onagui_type: string | null;
  created_at: string;
  is_admin: boolean;
  roles: string[];
}

export async function getGiveaways() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("giveaways")
    // ✅ Use "as const" + "any" cast to avoid TS inference issues safely
    .select("*")
    .eq("status" as any, "active" as any);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getUsers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("onagui_profiles")
    .select("*")
    .eq("is_active" as any, true as any);

  if (error) throw new Error(error.message);
  return data || [];
}



export async function fetchAdminUsers(): Promise<{ data: AdminUserWithRole[] | null; error: string | null }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
    const response = await fetch(`${baseUrl}/api/admin/users`, {
      headers: {
        cookie: cookieHeader,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData.error || 'Failed to fetch users' };
    }

    const { users } = await response.json();
    return { data: users as AdminUserWithRole[], error: null };
  } catch (error) {
    console.error("fetchAdminUsers error:", error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return { data: null, error: message };
  }
}