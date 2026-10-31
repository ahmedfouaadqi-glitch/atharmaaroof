"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode === "signup" ? "signup" : "login", email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "تعذر تنفيذ الطلب.");
        return;
      }
      if (mode === "signup" && result.needsEmailConfirmation) {
        setMessage(result.message);
        return;
      }
      window.location.assign("/");
    } catch {
      setError("تعذر الاتصال بالخادم. تحقق من الاتصال والإعدادات.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main dir="rtl" style={{ minHeight: "100vh", background: "#f6f7f4", display: "grid", placeItems: "center", padding: 20, color: "#23312b", fontFamily: "Arial, sans-serif" }}>
      <section style={{ width: "100%", maxWidth: 440, background: "#fff", border: "1px solid #e5ebe5", borderRadius: 22, padding: 28, boxShadow: "0 20px 70px #173c2d12" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#246246", textDecoration: "none", fontWeight: 700 }}>
          <ArrowRight size={18} /> العودة إلى أثَر
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 26 }}>
          <div style={{ width: 46, height: 46, display: "grid", placeItems: "center", borderRadius: 14, background: "#eaf5ee", color: "#23694e" }}><LockKeyhole size={22} /></div>
          <div><h1 style={{ margin: 0, fontSize: 26 }}>حساب أثَر</h1><p style={{ margin: "6px 0 0", color: "#748178", fontSize: 13 }}>لحفظ البلاغات وربطها بصاحبها</p></div>
        </div>
        <div style={{ display: "flex", gap: 8, margin: "24px 0 18px" }}>
          <button type="button" onClick={() => { setMode("login"); setError(""); setMessage(""); }} style={tabStyle(mode === "login")}>تسجيل الدخول</button>
          <button type="button" onClick={() => { setMode("signup"); setError(""); setMessage(""); }} style={tabStyle(mode === "signup")}>إنشاء حساب</button>
        </div>
        <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
          <label style={labelStyle}>البريد الإلكتروني<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="name@example.com" /></label>
          <label style={labelStyle}>كلمة المرور<input required type="password" minLength={10} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} placeholder="10 أحرف على الأقل" /></label>
          <p style={{ margin: 0, color: "#7d8981", fontSize: 12, lineHeight: 1.8 }}>لا تستخدم كلمة مرور سبق أن استخدمتها في موقع آخر.</p>
          {error && <p role="alert" style={noticeStyle("#fff0ee", "#a33a2e")}>{error}</p>}
          {message && <p role="status" style={noticeStyle("#eaf5ee", "#23694e")}>{message}</p>}
          <button disabled={busy} type="submit" style={{ border: 0, borderRadius: 10, padding: 14, background: busy ? "#8da99b" : "#1d6c59", color: "#fff", fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>
            {busy ? "جارٍ التنفيذ…" : mode === "signup" ? "إنشاء الحساب" : "دخول آمن"}
          </button>
        </form>
        <div style={{ display: "flex", gap: 9, alignItems: "flex-start", marginTop: 22, padding: 12, borderRadius: 12, background: "#f3f8f3", color: "#347c5b", fontSize: 12, lineHeight: 1.8 }}>
          <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: 2 }} /><span>لا تضع أرقام الهوية أو بيانات البطاقة المصرفية في اسم الحساب أو أي حقل عام. استخدم بريداً يمكنك الوصول إليه لتأكيد الحساب.</span>
        </div>
      </section>
    </main>
  );
}

function tabStyle(active: boolean): React.CSSProperties {
  return { flex: 1, border: "1px solid " + (active ? "#b8d8c4" : "#e5ebe5"), background: active ? "#eaf5ee" : "#fff", color: active ? "#23694e" : "#7b877f", borderRadius: 9, padding: 11, fontWeight: active ? 700 : 500, cursor: "pointer" };
}
const labelStyle: React.CSSProperties = { display: "grid", gap: 7, fontSize: 13, fontWeight: 700 };
const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #dfe7df", borderRadius: 9, padding: 12, outlineColor: "#1d6c59", background: "#fff", color: "#23312b" };
function noticeStyle(background: string, color: string): React.CSSProperties {
  return { margin: 0, background, color, padding: 12, borderRadius: 9, fontSize: 13, lineHeight: 1.8 };
}
