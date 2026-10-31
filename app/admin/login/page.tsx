"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Fingerprint, KeyRound, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { useInteractiveSound } from "@/components/useInteractiveSound";

export default function AdminLoginPage() {
  const sound = useInteractiveSound();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "admin_login", email, password })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "تعذر التحقق من صلاحيات حساب الإدارة.");
        return;
      }
      window.location.replace("/admin/reports");
    } catch {
      setError("تعذر الاتصال بخدمة الإدارة. تحقق من إعداد Supabase.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page admin-auth-page" dir="rtl" onClickCapture={sound.onInteraction} onPointerOverCapture={sound.onHover}>
      <div className="auth-orbit auth-orbit-a" />
      <div className="auth-orbit auth-orbit-b" />
      <section className="auth-card admin-auth-card">
        <div className="auth-topline">
          <Link href="/" className="auth-back"><ArrowRight size={17} /> العودة إلى الموقع</Link>
          <button
            type="button"
            className={sound.enabled ? "auth-sound sound-on" : "auth-sound"}
            onClick={sound.toggle}
            data-sound="manual"
            aria-label={sound.enabled ? "كتم المؤثرات الصوتية" : "تفعيل المؤثرات الصوتية"}
          >{sound.enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
        </div>
        <div className="admin-auth-brand">
          <BrandMark />
          <div><strong>أثر <b>معروف</b></strong><small>منطقة إدارة محمية</small></div>
        </div>
        <div className="auth-intro">
          <span className="auth-kicker"><ShieldCheck size={15} /> دخول إداري منفصل</span>
          <h1>دخول المشرفين</h1>
          <p>هذه الصفحة مخصصة للحسابات التي أُضيفت صراحةً إلى قائمة مشرفي أثر معروف.</p>
        </div>
        <form className="auth-form admin-auth-form" onSubmit={submit}>
          <label>البريد الإداري<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" /></label>
          <label>كلمة المرور<input required type="password" autoComplete="current-password" minLength={10} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="كلمة مرور حساب الإدارة" /></label>
          {error && <p className="auth-alert error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? "جارٍ التحقق..." : "دخول لوحة الإدارة"} <ArrowRight size={17} /></button>
        </form>
        <div className="auth-safety"><KeyRound size={18} /><span>لا يوجد إنشاء حساب إداري من هذه الصفحة. تُمنح صلاحية المشرف من قاعدة البيانات فقط.</span></div>
        <div className="auth-footer"><Fingerprint size={13} /> يتم فحص الدور على الخادم قبل عرض أي بيانات إدارية.</div>
      </section>
    </main>
  );
}
