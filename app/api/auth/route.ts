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

  const action = body.action;
  if (action !== "signup" && action !== "login" && action !== "logout") {
    return NextResponse.json({ error: "عملية غير مدعومة." }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();

    if (action === "logout") {
      const { error } = await supabase.auth.signOut();
      if (error) return NextResponse.json({ error: "تعذر تسجيل الخروج." }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 10 || password.length > 128) {
      return NextResponse.json({ error: "أدخل بريداً صحيحاً وكلمة مرور من 10 إلى 128 حرفاً." }, { status: 400 });
    }

    if (action === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: new URL("/auth/callback", request.url).toString() },
      });
      if (error) {
        return NextResponse.json({ error: "تعذر إنشاء الحساب. تحقق من الإعدادات أو جرّب بريداً آخر." }, { status: 400 });
      }
      return NextResponse.json({
        ok: true,
        needsEmailConfirmation: !data.session,
        message: data.session
          ? "تم إنشاء الحساب وتسجيل الدخول."
          : "تم إرسال رسالة تأكيد إذا كان البريد مؤهلاً. افتحها لتفعيل الحساب.",
      }, { status: 201 });
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة." }, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خدمة الحسابات غير مهيأة بعد. تحقق من إعدادات الخادم." }, { status: 503 });
  }
}
