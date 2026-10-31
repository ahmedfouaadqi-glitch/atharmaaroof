import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "أدخل بريداً إلكترونياً صحيحاً." }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "انتهت جلسة الزائر. أعد فتح نموذج البلاغ." }, { status: 401 });
    }

    if (!(user as typeof user & { is_anonymous?: boolean }).is_anonymous) {
      return NextResponse.json({ error: "هذه الجلسة مرتبطة بالفعل بحساب دائم." }, { status: 409 });
    }

    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: new URL("/auth/callback?next=%2F", request.url).toString() }
    );
    if (error) {
      console.error("ATHAR guest identity link failed", error.code);
      if (error.code === "email_exists" || error.code === "user_already_exists") {
        return NextResponse.json({ error: "هذا البريد مرتبط بحساب آخر. استخدم بريدك الحالي لتسجيل الدخول بدلاً من ربطه بهوية زائر." }, { status: 409 });
      }
      return NextResponse.json({ error: "تعذر إرسال رسالة ربط الهوية. تحقق من إعداد البريد في Supabase." }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "أرسلنا رسالة تأكيد إلى بريدك. افتح رابط التأكيد قبل حذف بيانات المتصفح؛ ستبقى البلاغات مرتبطة بمعرّف الحساب نفسه."
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch {
    return NextResponse.json({ error: "خدمة ربط هوية الزائر غير مهيأة بعد." }, { status: 503 });
  }
}
