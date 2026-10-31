import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CITIES = new Set(["بغداد", "كربلاء", "النجف", "البصرة", "سامراء"]);
const KINDS = new Set(["lost", "found"]);

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  return text.length ? text.slice(0, max) : null;
}

function looksSensitive(value: string): boolean {
  // Conservative guard against likely long identity/card numbers and common payment secrets.
  const digits = value.replace(/\D/g, "");
  return digits.length >= 12 || /\b(CVV|CVC|PIN|OTP|رمز التحقق|الرقم الوطني|رقم البطاقة)\b/i.test(value);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const city = request.nextUrl.searchParams.get("city");
    const kind = request.nextUrl.searchParams.get("kind");
    const limitRaw = Number(request.nextUrl.searchParams.get("limit") ?? 30);
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(50, Math.floor(limitRaw))) : 30;

    let query = supabase
      .from("athar_public_reports")
      .select("id,public_code,kind,category,title,city,area,details,status,created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (city && CITIES.has(city)) query = query.eq("city", city);
    if (kind && KINDS.has(kind)) query = query.eq("kind", kind);

    const { data, error } = await query;
    if (error) {
      console.error("ATHAR public report query failed", error.code);
      return NextResponse.json({ error: "تعذر جلب البلاغات حالياً." }, { status: 503 });
    }
    return NextResponse.json({ reports: data ?? [] }, {
      headers: { "Cache-Control": "public, max-age=15, stale-while-revalidate=30" },
    });
  } catch {
    return NextResponse.json({ error: "الخدمة غير مهيأة بعد. تحقق من إعدادات الخادم." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const kind = typeof body.kind === "string" ? body.kind : "";
  const category = cleanText(body.category, 80);
  const title = cleanText(body.title, 120);
  const city = typeof body.city === "string" ? body.city : "";
  const area = cleanText(body.area, 100);
  const details = cleanText(body.details, 500);

  if (!KINDS.has(kind) || !category || category.length < 2 || !title || title.length < 3 || !CITIES.has(city)) {
    return NextResponse.json({ error: "أكمل نوع البلاغ والفئة والعنوان والمدينة بصورة صحيحة." }, { status: 400 });
  }
  if ([title, category, area ?? "", details ?? ""].some(looksSensitive)) {
    return NextResponse.json({
      error: "لا تكتب أرقام الهوية أو أرقام البطاقات أو بيانات PIN/CVV/OTP. استخدم وصفاً عاماً غير حساس.",
    }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "سجّل الدخول أولاً حتى نربط البلاغ بحسابك." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("athar_reports")
      .insert({
        owner_id: user.id,
        kind,
        category,
        title,
        city,
        area,
        details,
      })
      .select("id,public_code,kind,category,title,city,area,status,created_at")
      .single();

    if (error) {
      console.error("ATHAR report insert failed", error.code);
      return NextResponse.json({ error: "تعذر حفظ البلاغ. تحقق من إعداد قاعدة البيانات." }, { status: 503 });
    }

    return NextResponse.json({ report: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "الخدمة غير مهيأة بعد. تحقق من إعدادات الخادم." }, { status: 503 });
  }
}
