"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Fingerprint, LockKeyhole, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import { useInteractiveSound } from "@/components/useInteractiveSound";
import { BrandMark } from "@/components/brand";

export default function LoginPage() {
  const sound = useInteractiveSound();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [magicBusy, setMagicBusy] = useState(false);
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

  async function sendMagicLink() {
    setMagicBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "magic_link", email })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تعذر إرسال رابط الدخول.");
      setMessage(result.message || "تحقق من بريدك لإكمال الدخول.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إرسال رابط الدخول.");
    } finally {
      setMagicBusy(false);
    }
  }

  return (
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
            <BrandMark />
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
            {mode === "login" && (
              <button className="auth-magic-link" type="button" onClick={() => void sendMagicLink()} disabled={magicBusy || !email.trim()}>
                {magicBusy ? "جارٍ إرسال الرابط..." : "إرسال رابط دخول إلى بريدي"}
              </button>
            )}
          </form>
          <div className="auth-safety"><ShieldCheck size={19} /><span>لا تضع رقم الهوية أو بيانات البطاقة المصرفية أو رموز التحقق في بيانات الحساب أو البلاغات العامة.</span></div>
          <div className="auth-footer"><LockKeyhole size={13} /> حماية الحساب تعتمد على إعدادات المصادقة في الخادم.</div>
        </section>
      </main>

  );
}

