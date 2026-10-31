import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ProtectedAdminReportsLayout({ children }: { children: ReactNode }) {
  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    redirect("/admin/login?reason=setup");
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/admin/login");

  const { data: admin, error: roleError } = await supabase
    .from("athar_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleError) redirect("/admin/login?reason=setup");
  if (!admin) redirect("/admin/login?reason=unauthorized");

  return children;
}
