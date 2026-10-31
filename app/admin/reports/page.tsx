"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock3, Eye, EyeOff, RefreshCw, ShieldCheck } from "lucide-react";

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
  { value: "hidden", label: "مخفي" },
];

export default function AdminReportsPage() {
  const [status, setStatus] = useState<Report["status"]>("pending");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/reports?status=" + status, { cache: "no-store" });
      const payload = await response.json();
      if (response.status === 401) {
        window.location.assign("/login");
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

  async function moderate(report: Report, nextStatus: Report["status"]) {
    setBusyId(report.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.id, status: nextStatus }),
      });
      const payload = await response.json();
      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }
      if (response.status === 403) throw new Error("هذا الحساب ليس ضمن مشرفي أثَر.");
      if (!response.ok) throw new Error(payload.error || "تعذر تحديث البلاغ.");
      setNotice("تم تحديث حالة " + report.public_code + ".");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحديث البلاغ.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <main dir="rtl" style={{ minHeight: "100vh", background: "#f5f7f4", color: "#20342a", padding: "28px 18px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1050, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#21684d", textDecoration: "none", fontWeight: 700 }}><ArrowRight size={17}/> العودة إلى أثَر</Link>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", margin: "28px 0 22px" }}>
          <div><div style={{ display: "flex", alignItems: "center", gap: 9, color: "#267052", fontSize: 13, fontWeight: 700 }}><ShieldCheck size={18}/> مساحة الإدارة</div><h1 style={{ fontSize: 30, margin: "8px 0" }}>مراجعة البلاغات</h1><p style={{ color: "#697970", margin: 0 }}>تظهر هنا البلاغات التي تسمح صلاحيات حسابك بمراجعتها.</p></div>
          <button onClick={() => void load()} disabled={loading} style={buttonStyle("#fff", "#28694f", "#dce7de")}><RefreshCw size={16}/> تحديث</button>
        </header>
        <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          {statuses.map(s => <button key={s.value} onClick={() => setStatus(s.value)} style={buttonStyle(status === s.value ? "#1f6b50" : "#fff", status === s.value ? "#fff" : "#3d5146", status === s.value ? "#1f6b50" : "#dce5dd")}>{s.label}</button>)}
        </nav>
        {error && <div role="alert" style={{ background: "#fff0ee", color: "#a43d30", padding: 14, borderRadius: 12, marginBottom: 14 }}>{error}</div>}
        {notice && <div role="status" style={{ background: "#e9f6ed", color: "#236844", padding: 14, borderRadius: 12, marginBottom: 14 }}>{notice}</div>}
        {loading ? <div style={panelStyle}>جارٍ تحميل البلاغات…</div> : reports.length === 0 ? <div style={{ ...panelStyle, textAlign: "center", padding: 46 }}><Clock3 size={26}/><h2 style={{ fontSize: 18 }}>لا توجد بلاغات بهذه الحالة</h2><p style={{ color: "#718078" }}>جرّب حالة أخرى أو حدّث القائمة.</p></div> : <div style={{ display: "grid", gap: 12 }}>
          {reports.map(report => <article key={report.id} style={panelStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div><div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><strong>{report.title}</strong><span style={{ fontSize: 12, background: "#eef4ef", padding: "4px 8px", borderRadius: 99 }}>{report.kind === "lost" ? "مفقود" : "معثور عليه"}</span></div><p style={{ color: "#63756a", fontSize: 13, margin: "8px 0" }}>{report.public_code} · {report.category} · {report.city}{report.area ? " · " + report.area : ""}</p>{report.details && <p style={{ lineHeight: 1.8, margin: "8px 0", overflowWrap: "anywhere" }}>{report.details}</p>}<small style={{ color: "#829087" }}>{new Date(report.created_at).toLocaleString("ar-IQ")}</small></div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                {status !== "published" && <button disabled={!!busyId} onClick={() => void moderate(report, "published")} style={buttonStyle("#e7f6eb", "#226b45", "#cde7d3")}><Eye size={15}/> نشر</button>}
                {status !== "hidden" && <button disabled={!!busyId} onClick={() => void moderate(report, "hidden")} style={buttonStyle("#fff1ed", "#9a4236", "#f2d7d1")}><EyeOff size={15}/> إخفاء</button>}
                {status !== "matched" && <button disabled={!!busyId} onClick={() => void moderate(report, "matched")} style={buttonStyle("#f0edff", "#5b4b9a", "#ded8fb")}>تطابق محتمل</button>}
                {status !== "returned" && <button disabled={!!busyId} onClick={() => void moderate(report, "returned")} style={buttonStyle("#e8f5f4", "#286b65", "#cce5e3")}><Check size={15}/> تمت الإعادة</button>}
                {status !== "pending" && <button disabled={!!busyId} onClick={() => void moderate(report, "pending")} style={buttonStyle("#f4f4f1", "#59645c", "#e2e4df")}>إرجاع للمراجعة</button>}
              </div>
            </div>
          </article>)}
        </div>}
        <p style={{ marginTop: 24, fontSize: 12, color: "#77847b", lineHeight: 1.8 }}>الوصول محمي بمصادقة الخادم ودور المشرف في قاعدة البيانات. لا تنشر أي بيانات حساسة حتى لو ظهرت في وصف البلاغ؛ راجعها قبل النشر.</p>
      </div>
    </main>
  );
}

function buttonStyle(background: string, color: string, border: string): React.CSSProperties {
  return { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, border: "1px solid " + border, background, color, borderRadius: 10, padding: "10px 13px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
}
const panelStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e1e8e1", borderRadius: 16, padding: 20, boxShadow: "0 6px 24px #183e2b08" };
