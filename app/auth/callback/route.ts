import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const otpType = request.nextUrl.searchParams.get("type");
  const nextPath = safeRedirectPath(request.nextUrl.searchParams.get("next"));
  const destination = new URL(nextPath, request.url);

  try {
    const supabase = await createSupabaseServerClient();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(destination);
    }

    if (tokenHash && otpType) {
      const type = otpType as Parameters<typeof supabase.auth.verifyOtp>[0]["type"];
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (!error) return NextResponse.redirect(destination);
    }
  } catch {
    // Fall through to a safe local error page.
  }

  return NextResponse.redirect(new URL("/login?error=confirmation", request.url));
}
