"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface AdminUserWithRole {
  id: string;
  email: string;
  onagui_type: string | null;
  created_at: string;
  is_admin: boolean;
  is_active: boolean;
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

export async function deactivateUser(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("onagui_profiles")
    .update({ is_active: false })
    .eq("id" as any, userId as any);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function fetchAdminUsers(): Promise<{ data: AdminUserWithRole[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("onagui_profiles")
      .select("id, email, onagui_type, created_at, is_admin, is_active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return { data: null, error: error.message };
    }

    return { data: data as AdminUserWithRole[], error: null };
  } catch (error) {
    console.error("fetchAdminUsers error:", error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return { data: null, error: message };
  }
}

export async function activateUser(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("onagui_profiles")
    .update({ is_active: true })
    .eq("id" as any, userId as any);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}