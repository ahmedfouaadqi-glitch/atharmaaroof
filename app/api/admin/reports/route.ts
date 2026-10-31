import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set(["pending", "published", "matched", "returned", "hidden"]);

async function getAdminClient() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { response: NextResponse.json({ error: "يلزم تسجيل الدخول." }, { status: 401 }) };
  }

  const { data: admin, error } = await supabase
    .from("athar_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("ATHAR admin role lookup failed", error.code);
    return { response: NextResponse.json({ error: "تعذر التحقق من صلاحيات الإدارة." }, { status: 503 }) };
  }
  if (!admin) {
    return { response: NextResponse.json({ error: "ليس لديك صلاحية إدارة البلاغات." }, { status: 403 }) };
  }
  return { supabase };
}

export async function GET(request: NextRequest) {
  const access = await getAdminClient();
  if ("response" in access) return access.response;

  const status = request.nextUrl.searchParams.get("status") ?? "pending";
  if (!STATUSES.has(status)) {
    return NextResponse.json({ error: "حالة البلاغ غير صحيحة." }, { status: 400 });
  }

  const { data, error } = await access.supabase
    .from("athar_reports")
    .select("id,public_code,kind,category,title,city,area,details,status,created_at,updated_at")
    .eq("status", status)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("ATHAR admin report query failed", error.code);
    return NextResponse.json({ error: "تعذر جلب البلاغات للمراجعة." }, { status: 503 });
  }

  return NextResponse.json({ reports: data ?? [] }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function PATCH(request: NextRequest) {
  const access = await getAdminClient();
  if ("response" in access) return access.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const status = typeof body.status === "string" ? body.status : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) || !STATUSES.has(status)) {
    return NextResponse.json({ error: "معرّف البلاغ أو الحالة غير صحيحة." }, { status: 400 });
  }

  const { data, error } = await access.supabase
    .rpc("athar_admin_set_report_status", {
      p_report_id: id,
      p_new_status: status,
    });

  if (error) {
    console.error("ATHAR admin moderation failed", error.code);
    return NextResponse.json({ error: "تعذر تحديث حالة البلاغ." }, { status: 503 });
  }
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return NextResponse.json({ error: "البلاغ غير موجود أو لا يمكن الوصول إليه." }, { status: 404 });
  }

  return NextResponse.json({ report: Array.isArray(data) ? data[0] : data });
}
