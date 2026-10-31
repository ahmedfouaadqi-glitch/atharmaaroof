import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    let { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      const result = await supabase.auth.signInAnonymously();
      user = result.data.user;
      error = result.error;
    }

    if (error || !user) {
      console.error("ATHAR guest session failed", error?.code ?? "no-user");
      return NextResponse.json({
        error: "تعذر إنشاء هوية زائر. فعّل Anonymous Sign-Ins في إعدادات Supabase Auth."
      }, { status: 503 });
    }

    const isAnonymous = Boolean((user as typeof user & { is_anonymous?: boolean }).is_anonymous);
    const guestCode = isAnonymous ? "ATH-" + user.id.replace(/-/g, "").slice(-8).toUpperCase() : null;

    return NextResponse.json({
      ok: true,
      anonymous: isAnonymous,
      guestCode,
      recoverability: isAnonymous
        ? "هوية الزائر محفوظة في جلسة المتصفح. اربطها ببريد أو وسيلة دخول لاستعادتها بعد حذف بيانات التصفح أو تغيير الجهاز."
        : "تم استخدام حسابك المسجل."
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch {
    return NextResponse.json({ error: "خدمة هوية الزائر غير مهيأة بعد." }, { status: 503 });
  }
}
