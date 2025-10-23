"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function activateUser(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("onagui_profiles")
    .update({ is_active: true })
    .eq("id" as any, userId as any);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}