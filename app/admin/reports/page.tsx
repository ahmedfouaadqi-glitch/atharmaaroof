"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Check, Clock3, Eye, EyeOff, RefreshCw, ShieldCheck, LogOut,
  Sparkles, FileText, MapPin, CalendarClock, X, Volume2, VolumeX
} from "lucide-react";
import { useInteractiveSound } from "@/components/useInteractiveSound";
import { BrandMark } from "@/components/brand";

type Report = {
  id: string;
  public_code: string;
  kind: "lost" | "found";
  category: string;
  title: string;
  city: string;
  area: string | null;
  details: string | null;
  status: "pending" | "published" | "matched" | "returned" | "hidden";
  created_at: string;
};

const statuses: { value: Report["status"]; label: string }[] = [
  { value: "pending", label: "بانتظار المراجعة" },
  { value: "published", label: "منشور" },
  { value: "matched", label: "تطابق محتمل" },
  { value: "returned", label: "تمت الإعادة" },
  { value: "hidden", label: "مخفي" }
];

export default function AdminReportsPage() {
  const sound = useInteractiveSound();
  const [status, setStatus] = useState<Report["status"]>("pending");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/reports?status=" + status, { cache: "no-store" });
      const payload = await response.json();
      if (response.status === 401) {
        window.location.assign("/control-center");
        return;
      }
      if (!response.ok) throw new Error(payload.error || "تعذر تحميل البلاغات.");
      setReports(payload.reports ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" })
      });
    } finally {
      window.location.replace("/control-center");
    }
  }

  async function moderate(report: Report, nextStatus: Report["status"]) {
    setBusyId(report.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.id, status: nextStatus })
      });
      const payload = await response.json();
      if (response.status === 401) {
        window.location.assign("/control-center");
        return;
      }
      if (response.status === 403) throw new Error("هذا الحساب ليس ضمن مشرفي أثر معروف.");
      if (!response.ok) throw new Error(payload.error || "تعذر تحديث البلاغ.");
      setNotice("تم تحديث حالة البلاغ " + report.public_code + ".");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحديث البلاغ.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="app-shell admin-shell" dir="rtl" onClickCapture={sound.onInteraction} onPointerOverCapture={sound.onHover}>
        <header className="topbar admin-topbar">
          <Link href="/" className="brand-lockup">
            <BrandMark />
            <span className="brand-copy"><strong>أثر <b>معروف</b></strong><small>لوحة مراجعة البلاغات</small></span>
          </Link>
          <div className="admin-top-actions">
            <button
              type="button"
              className={sound.enabled ? "icon-action sound-on" : "icon-action"}
              onClick={sound.toggle}
              data-sound="manual"
              aria-label={sound.enabled ? "كتم المؤثرات الصوتية" : "تفعيل المؤثرات الصوتية"}
              aria-pressed={sound.enabled}
              title={sound.enabled ? "الصوت مفعّل" : "الصوت مكتوم"}
            >{sound.enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
            <span className="admin-secure"><ShieldCheck size={15} /> وصول المشرفين فقط</span>
            <button className="admin-home-link" onClick={() => void signOut()} disabled={signingOut}>
              <LogOut size={15} /> {signingOut ? "جارٍ الخروج..." : "تسجيل الخروج"}
            </button>
          </div>
        </header>

        <main className="page-content admin-content">
          <section className="admin-heading">
            <div>
              <span className="section-kicker"><Sparkles size={14} /> أثر معروف · الإدارة</span>
              <h1>مراجعة البلاغات</h1>
              <p>راجع البلاغات قبل نشرها، وحدّث حالتها عبر صلاحيات الخادم.</p>
            </div>
            <button className="admin-refresh" onClick={() => void load()} disabled={loading}>
              <RefreshCw size={16} className={loading ? "refresh-spinning" : ""} /> تحديث القائمة
            </button>
          </section>

          <section className="admin-status-strip" aria-label="حالة البلاغ">
            {statuses.map((item) => (
              <button key={item.value} className={status === item.value ? "admin-status-tab active" : "admin-status-tab"} onClick={() => setStatus(item.value)} aria-pressed={status === item.value}>
                {item.label}
              </button>
            ))}
          </section>

          {error && <div className="admin-alert error" role="alert"><X size={17} />{error}</div>}
          {notice && <div className="admin-alert success" role="status"><Check size={17} />{notice}</div>}

          <div className="admin-list-header">
            <div><b>{statuses.find((item) => item.value === status)?.label}</b><small>{loading ? "جارٍ تحميل القائمة" : reports.length.toLocaleString("ar-IQ") + " بلاغ"}</small></div>
            <span><ShieldCheck size={15} /> البيانات خاصة بمساحة الإدارة</span>
          </div>

          {loading ? (
            <div className="admin-empty"><span className="loader-ring" /><b>جارٍ تحميل البلاغات</b></div>
          ) : reports.length === 0 ? (
            <div className="admin-empty"><FileText size={26} /><b>لا توجد بلاغات بهذه الحالة</b><small>لا توجد بيانات تجريبية هنا؛ القائمة تعرض ما أعاده الخادم فقط.</small></div>
          ) : (
            <div className="admin-report-list">
              {reports.map((report) => (
                <article key={report.id} className="admin-report-card">
                  <div className="admin-report-top">
                    <div className="admin-report-symbol"><FileText size={20} /></div>
                    <div className="admin-report-title">
                      <div><b>{report.title}</b><span className={report.kind === "found" ? "type-badge found" : "type-badge lost"}>{report.kind === "found" ? "معثور عليه" : "مفقود"}</span></div>
                      <small>{report.public_code} · {report.category}</small>
                    </div>
                    <span className="admin-report-state">{statuses.find((item) => item.value === report.status)?.label ?? report.status}</span>
                  </div>
                  <div className="admin-report-meta">
                    <span><MapPin size={13} /> {report.city}{report.area ? " · " + report.area : ""}</span>
                    <span><CalendarClock size={13} /> {new Date(report.created_at).toLocaleString("ar-IQ")}</span>
                  </div>
                  {report.details && <p className="admin-report-details">{report.details}</p>}
                  <div className="admin-report-actions">
                    {status !== "published" && <button disabled={!!busyId} onClick={() => void moderate(report, "published")} className="admin-action publish"><Eye size={14} /> نشر</button>}
                    {status !== "hidden" && <button disabled={!!busyId} onClick={() => void moderate(report, "hidden")} className="admin-action hide"><EyeOff size={14} /> إخفاء</button>}
                    {status !== "matched" && <button disabled={!!busyId} onClick={() => void moderate(report, "matched")} className="admin-action match">تطابق محتمل</button>}
                    {status !== "returned" && <button disabled={!!busyId} onClick={() => void moderate(report, "returned")} className="admin-action returned"><Check size={14} /> تمت الإعادة</button>}
                    {status !== "pending" && <button disabled={!!busyId} onClick={() => void moderate(report, "pending")} className="admin-action reset"><Clock3 size={14} /> للمراجعة</button>}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="admin-security-note"><ShieldCheck size={17} /><p>بيانات الإدارة محمية بمصادقة الخادم ودور المشرف. راجع أي وصف قبل نشره، ولا تنشر أرقام المستمسكات أو بيانات الاتصال أو أي معلومة حساسة.</p></div>
        </main>
      </div>

  );
}

