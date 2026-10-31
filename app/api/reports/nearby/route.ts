import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "إحداثيات الموقع غير صحيحة." }, { status: 400 });
  }

  const lat = Number(body.latitude);
  const lng = Number(body.longitude);
  const radiusKm = Number(body.radiusKm ?? 5);

  if (
    !Number.isFinite(lat) || lat < -90 || lat > 90 ||
    !Number.isFinite(lng) || lng < -180 || lng > 180 ||
    !Number.isFinite(radiusKm) || radiusKm < 0.5 || radiusKm > 25
  ) {
    return NextResponse.json({ error: "تأكد من صحة الموقع ونطاق البحث بين 0.5 و25 كيلومتراً." }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("athar_find_nearby_reports", {
      p_lat: lat,
      p_lng: lng,
      p_radius_m: Math.round(radiusKm * 1000),
      p_limit: 25
    });

    if (error) {
      console.error("ATHAR nearby search failed", error.code);
      return NextResponse.json({
        error: "ميزة البلاغات القريبة تحتاج تطبيق ترحيل الموقع التقريبي في قاعدة البيانات."
      }, { status: 503 });
    }

    return NextResponse.json({ reports: data ?? [], radiusKm }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch {
    return NextResponse.json({ error: "تعذر تنفيذ البحث القريب حالياً." }, { status: 503 });
  }
}
