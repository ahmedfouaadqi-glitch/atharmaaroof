"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Fingerprint, LockKeyhole, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import ClickSpark from "@/components/reactbits/ClickSpark";
import { useInteractiveSound } from "@/components/useInteractiveSound";

export default function LoginPage() {
  const sound = useInteractiveSound();
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
        body: JSON.stringify({ action: mode === "signup" ? "signup" : "login", email, password })
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
    <ClickSpark className="auth-interaction-layer" style={{ minHeight: "100vh" }} sparkColor="#39e2c3" shape="star" sparkCount={7}>
      <main className="auth-page" dir="rtl" onClickCapture={sound.onInteraction} onPointerOverCapture={sound.onHover}>
        <div className="auth-orbit auth-orbit-a" />
        <div className="auth-orbit auth-orbit-b" />
        <section className="auth-card">
          <div className="auth-topline">
            <Link href="/" className="auth-back"><ArrowRight size={17} /> العودة إلى أثر معروف</Link>
            <button
              type="button"
              className={sound.enabled ? "auth-sound sound-on" : "auth-sound"}
              onClick={sound.toggle}
              data-sound="manual"
              aria-label={sound.enabled ? "كتم المؤثرات الصوتية" : "تفعيل المؤثرات الصوتية"}
              aria-pressed={sound.enabled}
              title={sound.enabled ? "الصوت مفعّل" : "الصوت مكتوم"}
            >{sound.enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
          </div>
          <div className="auth-brand">
            <AuthBrandMark />
            <div><strong>أثر <b>معروف</b></strong><small>حسابك ومساحة بلاغاتك</small></div>
          </div>
          <div className="auth-intro">
            <span className="auth-kicker"><Fingerprint size={15} /> وصول آمن</span>
            <h1>{mode === "login" ? "مرحباً بعودتك" : "أنشئ حسابك"}</h1>
            <p>استخدم حسابك لمتابعة البلاغات وربطها بك بأمان.</p>
          </div>
          <div className="auth-tabs">
            <button type="button" onClick={() => { setMode("login"); setError(""); setMessage(""); }} className={mode === "login" ? "selected" : ""}>تسجيل الدخول</button>
            <button type="button" onClick={() => { setMode("signup"); setError(""); setMessage(""); }} className={mode === "signup" ? "selected" : ""}>إنشاء حساب</button>
          </div>
          <form className="auth-form" onSubmit={submit}>
            <label>البريد الإلكتروني<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></label>
            <label>كلمة المرور<input required type="password" minLength={10} maxLength={128} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="10 أحرف على الأقل" /></label>
            <small className="auth-hint">لا تستخدم كلمة مرور سبق أن استخدمتها في موقع آخر.</small>
            {error && <p className="auth-alert error" role="alert">{error}</p>}
            {message && <p className="auth-alert success" role="status"><CheckCircle2 size={17} />{message}</p>}
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? "جارٍ التنفيذ…" : mode === "signup" ? "إنشاء الحساب" : "دخول آمن"} <ArrowRight size={17} /></button>
          </form>
          <div className="auth-safety"><ShieldCheck size={19} /><span>لا تضع رقم الهوية أو بيانات البطاقة المصرفية أو رموز التحقق في بيانات الحساب أو البلاغات العامة.</span></div>
          <div className="auth-footer"><LockKeyhole size={13} /> حماية الحساب تعتمد على إعدادات المصادقة في الخادم.</div>
        </section>
      </main>
    </ClickSpark>
  );
}

function AuthBrandMark() {
  return <span className="brand-mark"><svg viewBox="0 0 56 56" fill="none"><rect x="10" y="7" width="29" height="40" rx="8" stroke="currentColor" strokeWidth="2.8"/><path d="M31 8v10h8M17 25h14M17 32h10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="39" cy="39" r="11" fill="#2ADDC0" stroke="#09272A" strokeWidth="2.5"/><path d="m34 39 3.2 3.2 6.3-7" stroke="#063638" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round"/></svg></span>;
}
