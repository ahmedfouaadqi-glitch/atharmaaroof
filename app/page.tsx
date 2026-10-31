"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useInteractiveSound } from "@/components/useInteractiveSound";
import Link from "next/link";
import {
  ArrowUp, Bell, Check, CheckCircle2, ChevronLeft, CircleHelp, Clock3,
  CreditCard, Download, FileText, Fingerprint, HeartHandshake, House,
  KeyRound, MapPin, MapPinned, Menu, Plus, Search, ShieldCheck,
  Smartphone, Sparkles, Volume2, VolumeX, Wallet, X
} from "lucide-react";
import ClickSpark from "@/components/reactbits/ClickSpark";
import Magnet from "@/components/reactbits/Magnet";
import SpotlightCard from "@/components/reactbits/SpotlightCard";

type Report = {
  id: string;
  public_code: string;
  title: string;
  category: string;
  city: string;
  area: string | null;
  kind: "lost" | "found";
  status: "pending" | "published" | "matched" | "returned" | "hidden" | string;
  created_at: string;
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const cities = ["الكل", "بغداد", "كربلاء", "النجف", "البصرة", "سامراء"];
const categories = [
  "بطاقة وطنية", "بطاقة سكن", "بطاقة تموينية", "إجازة سياقة",
  "سنوية سيارة", "بطاقة مصرفية", "محفظة", "مفاتيح", "أخرى"
];

const quickActions = [
  { label: "بطاقة وطنية", icon: Fingerprint },
  { label: "إجازة سياقة", icon: CreditCard },
  { label: "محفظة", icon: Wallet },
  { label: "مفاتيح", icon: KeyRound }
];

export default function HomePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const [city, setCity] = useState("الكل");
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [query, setQuery] = useState("");
  const [assistantText, setAssistantText] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [kind, setKind] = useState<"lost" | "found">("lost");
  const [category, setCategory] = useState(categories[0]);
  const [formCity, setFormCity] = useState("بغداد");
  const [area, setArea] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const sound = useInteractiveSound();
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [reloadKey, setReloadKey] = useState(0);
  const toastTimer = useRef<number | null>(null);

  const shownReports = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ar");
    return reports.filter((report) => {
      const matchesQuery = !needle || [report.title, report.category, report.city, report.area ?? ""]
        .join(" ").toLocaleLowerCase("ar").includes(needle);
      return matchesQuery && (filter === "all" || report.kind === filter);
    });
  }, [reports, query, filter]);

  const lostCount = reports.filter((report) => report.kind === "lost").length;
  const foundCount = reports.filter((report) => report.kind === "found").length;

  function notify(message: string, tone: "tap" | "success" | "open" | "toggle" = "tap") {
    setToast(message);
    if (tone !== "tap") sound.play(tone);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3600);
  }

  function scrollTo(id: string, nav = id) {
    setActiveNav(nav);
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    
  }

  function openReportForm(nextKind: "lost" | "found", nextCategory?: string) {
    setKind(nextKind);
    if (nextCategory) setCategory(nextCategory);
    setFormOpen(true);
    setShowInstallHelp(false);
    
  }

  useEffect(() => {
    let cancelled = false;
    async function loadReports() {
      setReportsLoading(true);
      setReportsError("");
      try {
        const params = new URLSearchParams({ limit: "40" });
        if (city !== "الكل") params.set("city", city);
        if (filter !== "all") params.set("kind", filter);
        const response = await fetch("/api/reports?" + params.toString(), { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "تعذر تحميل البلاغات.");
        if (!cancelled) {
          setReports((payload.reports ?? []).map((report: Report) => report));
        }
      } catch (error) {
        if (!cancelled) {
          setReports([]);
          setReportsError(error instanceof Error ? error.message : "تعذر الاتصال بخدمة البلاغات.");
        }
      } finally {
        if (!cancelled) setReportsLoading(false);
      }
    }
    void loadReports();
    return () => { cancelled = true; };
  }, [city, filter, reloadKey]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(".reveal");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [reports.length, reportsLoading, formOpen]);

  function handleAssistantSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = assistantText.trim();
    if (!value) return;
    setQuery(value);
    setAssistantText("");
    notify("بحثنا في البلاغات المنشورة حسب الوصف. لا نعرض نتائج تجريبية.", "success");
    scrollTo("reports", "reports");
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const combined = [category, area, details].join(" ");
    const digits = combined.replace(/\D/g, "");
    if (digits.length >= 12 || /\b(CVV|CVC|PIN|OTP)\b|الرقم الوطني|رقم البطاقة|رمز التحقق/i.test(combined)) {
      notify("احذف أرقام المستمسكات وبيانات البطاقة والرموز السرية قبل الإرسال.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          category,
          title: category + (kind === "lost" ? " مفقودة" : " معثور عليها"),
          city: formCity,
          area,
          details
        })
      });
      const payload = await response.json();
      if (response.status === 401) {
        notify("سجّل الدخول أولاً حتى نربط البلاغ بحسابك.");
        window.location.assign("/login");
        return;
      }
      if (!response.ok) throw new Error(payload.error || "تعذر حفظ البلاغ.");
      setFormOpen(false);
      setArea("");
      setDetails("");
      setCategory(categories[0]);
      setReloadKey((value) => value + 1);
      notify("تم استلام البلاغ، وهو بانتظار مراجعة المشرف قبل نشره.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "تعذر حفظ البلاغ. حاول لاحقاً.");
    } finally {
      setBusy(false);
    }
  }

  async function installApplication() {
    
    if (!installPrompt) {
      setShowInstallHelp((value) => !value);
      return;
    }
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      notify(choice.outcome === "accepted" ? "تم إرسال طلب تثبيت أثر معروف." : "يمكنك تثبيت التطبيق لاحقاً من قائمة المتصفح.", "success");
    } catch {
      notify("تعذر فتح نافذة التثبيت. استخدم قائمة المتصفح ثم أضف إلى الشاشة الرئيسية.");
    }
  }

  const reportStatus = (status: string) => {
    if (status === "published") return "منشور";
    if (status === "matched") return "تطابق محتمل";
    if (status === "returned") return "تمت الإعادة";
    return "غير متاح";
  };

  return (
    <ClickSpark
      className="app-interaction-layer"
      style={{ minHeight: "100vh" }}
      sparkColor={["#38e2c5", "#d8fff5", "#f3ae58"]}
      sparkSize={8}
      sparkRadius={34}
      sparkCount={8}
      duration={460}
      shape="star"
      gravity={0.35}
      glow={0.45}
    >
      <div className="app-shell" dir="rtl" onClickCapture={sound.onInteraction}>
        <div className="ambient ambient-one" aria-hidden="true" />
        <div className="ambient ambient-two" aria-hidden="true" />

        <header className="topbar" id="home">
          <Link href="/" className="brand-lockup" aria-label="أثر معروف — الصفحة الرئيسية">
            <BrandMark />
            <span className="brand-copy">
              <strong>أثر <b>معروف</b></strong>
              <small>مفقوداتك تلقى طريقها</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            <button className={activeNav === "home" ? "nav-link active" : "nav-link"} onClick={() => scrollTo("home", "home")}>الرئيسية</button>
            <button className={activeNav === "reports" ? "nav-link active" : "nav-link"} onClick={() => scrollTo("reports", "reports")}>البلاغات</button>
            <button className={activeNav === "safety" ? "nav-link active" : "nav-link"} onClick={() => scrollTo("safety", "safety")}>الأمان والخصوصية</button>
          </nav>

          <div className="header-actions">
            <button
              className={sound.enabled ? "icon-action sound-on" : "icon-action"}
              onClick={sound.toggle}
              data-sound="manual"
              aria-label={sound.enabled ? "كتم المؤثرات الصوتية" : "تفعيل المؤثرات الصوتية"}
              aria-pressed={sound.enabled}
              title={sound.enabled ? "الصوت مفعّل" : "الصوت مكتوم"}
            >
              {sound.enabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
            </button>
            <button className="icon-action install-action" onClick={() => void installApplication()} aria-label="تثبيت التطبيق" title="تثبيت التطبيق">
              <Download size={18} />
            </button>
            <button className="icon-action notification-action" onClick={() => notify("لا توجد إشعارات جديدة حالياً.")} aria-label="الإشعارات">
              <Bell size={19} />
              <i className="notification-dot" />
            </button>
            <Link className="account-link" href="/login"><span className="avatar">م</span><span>حسابي</span></Link>
            <button className="icon-action mobile-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="فتح القائمة">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {menuOpen && (
            <div className="mobile-menu">
              <button onClick={() => scrollTo("home", "home")}><House size={17} /> الرئيسية</button>
              <button onClick={() => scrollTo("reports", "reports")}><FileText size={17} /> البلاغات</button>
              <button onClick={() => scrollTo("safety", "safety")}><ShieldCheck size={17} /> الأمان والخصوصية</button>
              <Link href="/login"><Fingerprint size={17} /> حسابي وتسجيل الدخول</Link>
            </div>
          )}
        </header>

        <div className="install-hint-wrap">
          {showInstallHelp && (
            <div className="install-hint" role="status">
              <Smartphone size={18} />
              <span>من قائمة المتصفح اختر <b>إضافة إلى الشاشة الرئيسية</b> لتثبيت أثر معروف.</span>
              <button onClick={() => setShowInstallHelp(false)} aria-label="إغلاق"><X size={15} /></button>
            </div>
          )}
        </div>

        <main className="page-content">
          <section className="hero-section reveal">
            <SpotlightCard
              className="hero-card"
              theme="dark"
              spotlightColor="rgba(48, 222, 195, 0.92)"
              intensity={0.32}
              spotlightSize={310}
              softness={0.72}
              borderGlow={0.72}
              proximity={80}
              smoothing={0.34}
              ambient
              grain={0.08}
            >
              <div className="hero-grid">
                <div className="hero-copy">
                  <div className="assistant-status"><span className="online-pulse" /> مساعد البلاغات <Sparkles size={15} /><small>متاح لمساعدتك</small></div>
                  <p className="greeting">أهلاً بيك في <b>أثر معروف</b></p>
                  <h1>مفقودك مو نهاية الحكاية،<br /><em>خلّينا نساعدك يرجع.</em></h1>
                  <p className="hero-description">سجّل بلاغ فقدان أو عثور، وابحث بين البلاغات المنشورة. معلوماتك الشخصية تبقى محمية.</p>

                  <form className="assistant-input" onSubmit={handleAssistantSubmit}>
                    <Search size={20} />
                    <input
                      value={assistantText}
                      onChange={(event) => setAssistantText(event.target.value)}
                      placeholder="اكتب وصف المفقود أو مكان العثور..."
                      aria-label="ابحث في البلاغات"
                    />
                    <button type="submit" aria-label="ابحث"><ArrowUp size={20} /></button>
                  </form>
                  <div className="quick-actions">
                    <span>جرّب البحث عن:</span>
                    {quickActions.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button key={item.label} onClick={() => { setQuery(item.label); scrollTo("reports", "reports"); }}>
                          <Icon size={13} />{item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="hero-visual" aria-hidden="true">
                  <div className="visual-glow" />
                  <div className="visual-ring ring-a" />
                  <div className="visual-ring ring-b" />
                  <div className="document-card document-back">
                    <div className="document-top"><span /> <span /> <span /></div>
                    <div className="document-avatar"><Fingerprint size={29} /></div>
                    <div className="document-lines"><i /><i /><i /></div>
                    <small>مستند شخصي</small>
                  </div>
                  <div className="document-card document-front">
                    <div className="document-icon"><FileText size={23} /></div>
                    <i /><i className="line-short" />
                    <div className="verified-seal"><Check size={16} /></div>
                  </div>
                  <div className="floating-chip chip-top"><ShieldCheck size={15} /> خصوصيتك أولاً</div>
                  <div className="floating-chip chip-bottom"><MapPin size={14} /> نطاق مكاني تقريبي</div>
                </div>
              </div>
              <div className="hero-foot">
                <span><ShieldCheck size={15} /> لا نطلب صورة المستمسك</span>
                <span><LockKeyholeMini /> بياناتك ليست معروضة للعامة</span>
                <span><MapPin size={14} /> تغطية مدن عراقية</span>
              </div>
            </SpotlightCard>
          </section>

          <section className="insight-row reveal" aria-label="ملخص البلاغات">
            <SpotlightCard className="insight-card" theme="dark" style={{ "--spotlight-card-surface": "rgba(9,39,41,.9)", "--spotlight-card-border": "rgba(151,218,207,.12)", "--spotlight-card-shadow": "0 14px 35px rgba(0,0,0,.12)" } as CSSProperties} spotlightColor="rgba(40, 217, 186, .6)" intensity={0.15} spotlightSize={190}>
              <span className="insight-icon"><FileText size={19} /></span>
              <span className="insight-label">بلاغات معروضة</span>
              <strong>{reportsLoading ? "…" : reportsError ? "—" : reports.length.toLocaleString("ar-IQ")}</strong>
              <small>ضمن البيانات المحمّلة حالياً</small>
            </SpotlightCard>
            <SpotlightCard className="insight-card" theme="dark" style={{ "--spotlight-card-surface": "rgba(9,39,41,.9)", "--spotlight-card-border": "rgba(151,218,207,.12)", "--spotlight-card-shadow": "0 14px 35px rgba(0,0,0,.12)" } as CSSProperties} spotlightColor="rgba(242, 174, 87, .52)" intensity={0.14} spotlightSize={180}>
              <span className="insight-icon amber"><Search size={19} /></span>
              <span className="insight-label">بلاغات فقدان</span>
              <strong>{reportsLoading ? "…" : reportsError ? "—" : lostCount.toLocaleString("ar-IQ")}</strong>
              <small>من قائمة النتائج الحالية</small>
            </SpotlightCard>
            <SpotlightCard className="insight-card" theme="dark" style={{ "--spotlight-card-surface": "rgba(9,39,41,.9)", "--spotlight-card-border": "rgba(151,218,207,.12)", "--spotlight-card-shadow": "0 14px 35px rgba(0,0,0,.12)" } as CSSProperties} spotlightColor="rgba(94, 171, 255, .52)" intensity={0.14} spotlightSize={180}>
              <span className="insight-icon blue"><HeartHandshake size={19} /></span>
              <span className="insight-label">بلاغات العثور</span>
              <strong>{reportsLoading ? "…" : reportsError ? "—" : foundCount.toLocaleString("ar-IQ")}</strong>
              <small>من قائمة النتائج الحالية</small>
            </SpotlightCard>
          </section>
          <p className="metric-note">الأرقام أعلاه تُحسب من البلاغات التي أعادها الخادم في هذه الصفحة، وليست إحصاءً وطنياً شاملاً.</p>

          <section className="action-panel reveal">
            <div className="action-copy">
              <span className="section-kicker"><Sparkles size={14} /> ابدأ بخطوة واضحة</span>
              <h2>شنو اللي صار وياك؟</h2>
              <p>اختار نوع البلاغ حتى نوجّهك للنموذج المناسب.</p>
            </div>
            <div className="action-buttons">
              <Magnet padding={76} magnetStrength={3.2} maxOffset={8} tilt={2}>
                <button className="primary-action" onClick={() => openReportForm("lost")}><Search size={18} /> فقدت مستمسكاً <ChevronLeft size={17} /></button>
              </Magnet>
              <Magnet padding={76} magnetStrength={3.2} maxOffset={8} tilt={2}>
                <button className="secondary-action" onClick={() => openReportForm("found")}><Plus size={18} /> عثرت على مستمسك <ChevronLeft size={17} /></button>
              </Magnet>
            </div>
          </section>

          <section className="reports-section reveal" id="reports">
            <div className="section-heading">
              <div>
                <span className="section-kicker"><MapPinned size={14} /> من المجتمع</span>
                <h2>بلاغات المفقودات والمعثورات</h2>
                <p>تظهر هنا البلاغات التي نُشرت بعد مراجعتها، دون بيانات اتصال شخصية.</p>
              </div>
              <button className="text-button" onClick={() => { setCity("الكل"); setFilter("all"); setQuery("");  }}>إعادة ضبط <X size={15} /></button>
            </div>

            <div className="reports-toolbar">
              <label className="report-search">
                <Search size={18} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بنوع المستمسك أو المدينة..." aria-label="بحث في البلاغات" />
                {query && <button onClick={() => setQuery("")} aria-label="مسح البحث"><X size={14} /></button>}
              </label>
              <div className="filter-pills" role="group" aria-label="تصفية البلاغات">
                <button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>الكل</button>
                <button className={filter === "lost" ? "selected" : ""} onClick={() => setFilter("lost")}>مفقود</button>
                <button className={filter === "found" ? "selected" : ""} onClick={() => setFilter("found")}>معثور عليه</button>
              </div>
              <label className="city-field"><MapPin size={15} /><select value={city} onChange={(event) => setCity(event.target.value)} aria-label="المدينة">{cities.map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>

            <div className="report-results">
              {reportsLoading ? (
                <div className="empty-state"><span className="loader-ring" /><b>جارٍ تحميل البلاغات المنشورة</b><small>نطلب البيانات من الخادم.</small></div>
              ) : reportsError ? (
                <div className="empty-state error-state"><ShieldCheck size={27} /><b>تعذر الاتصال بخدمة البلاغات</b><small>{reportsError} لم نعرض بيانات بديلة أو تجريبية.</small><button onClick={() => setReloadKey((value) => value + 1)}>إعادة المحاولة <ChevronLeft size={15} /></button></div>
              ) : shownReports.length ? (
                shownReports.map((report) => (
                  <article className="report-item" key={report.id}>
                    <div className={report.kind === "found" ? "report-icon found" : "report-icon lost"}>{report.kind === "found" ? <CheckCircle2 size={19} /> : <FileText size={19} />}</div>
                    <div className="report-details">
                      <div className="report-title-row"><b>{report.title}</b><span className={report.kind === "found" ? "type-badge found" : "type-badge lost"}>{report.kind === "found" ? "معثور عليه" : "مفقود"}</span></div>
                      <div className="report-meta"><span><MapPin size={12} /> {report.city}{report.area ? " · " + report.area : ""}</span><span><Clock3 size={12} /> {new Date(report.created_at).toLocaleDateString("ar-IQ")}</span></div>
                    </div>
                    <span className="report-state"><i />{reportStatus(report.status)}</span>
                    <button className="report-more" onClick={() => notify("التواصل الخاص يتطلب حساباً ومسار استرجاع موثّقاً.")} aria-label="تفاصيل البلاغ"><ChevronLeft size={18} /></button>
                  </article>
                ))
              ) : (
                <div className="empty-state"><Search size={27} /><b>لا توجد نتائج مطابقة حالياً</b><small>جرّب تغيير المدينة أو نوع البلاغ أو كلمة البحث.</small><button onClick={() => { setCity("الكل"); setFilter("all"); setQuery(""); }}>عرض جميع البلاغات</button></div>
              )}
            </div>
            <div className="results-foot"><span>النتائج الآمنة المنشورة فقط</span><button onClick={() => openReportForm("lost")}>أضف بلاغاً جديداً <Plus size={15} /></button></div>
          </section>

          <section className="safety-section reveal" id="safety">
            <div className="safety-symbol"><ShieldCheck size={30} /></div>
            <div className="safety-text">
              <span className="section-kicker">الأمان جزء من التصميم</span>
              <h2>مستمسكك إلك، وخصوصيتك إلنا.</h2>
              <p>لا تنشر رقم الهوية أو صورة المستمسك أو بيانات البطاقة المصرفية. استخدم وصفاً عاماً ومنطقة تقريبية فقط.</p>
            </div>
            <div className="safety-points">
              <span><Check size={15} /> لا صور مستمسكات في البلاغ العام</span>
              <span><Check size={15} /> لا أرقام هوية أو رموز سرية</span>
              <span><Check size={15} /> لا نعرض موقعك الدقيق</span>
            </div>
          </section>

          <section className="install-card reveal">
            <div className="install-icon"><Smartphone size={22} /></div>
            <div><b>خلّي أثر معروف قريب منك</b><p>ثبّت التطبيق على الشاشة الرئيسية للوصول إليه مثل التطبيقات المعتادة.</p></div>
            <Magnet padding={60} magnetStrength={3} maxOffset={7}>
              <button onClick={() => void installApplication()}><Download size={16} /> تثبيت التطبيق</button>
            </Magnet>
          </section>

          <footer className="site-footer">
            <div className="footer-brand"><BrandMark /><span><b>أثر معروف</b><small>منصة عراقية للمفقودات والمعثورات</small></span></div>
            <span>© {new Date().getFullYear()} أثر معروف. جميع الحقوق محفوظة.</span>
            <a href="https://reactbits.dev/" target="_blank" rel="noreferrer">تفاعلات مستلهمة من React Bits</a>
          </footer>
        </main>

        <nav className="bottom-nav" aria-label="التنقل السفلي">
          <button className={activeNav === "home" ? "bottom-item active" : "bottom-item"} onClick={() => scrollTo("home", "home")}><House size={20} /><small>الرئيسية</small></button>
          <button className={activeNav === "reports" ? "bottom-item active" : "bottom-item"} onClick={() => scrollTo("reports", "reports")}><FileText size={20} /><small>البلاغات</small></button>
          <button className="bottom-add" onClick={() => openReportForm("lost")} aria-label="إضافة بلاغ"><Plus size={25} /></button>
          <button className={activeNav === "safety" ? "bottom-item active" : "bottom-item"} onClick={() => scrollTo("safety", "safety")}><ShieldCheck size={20} /><small>الأمان</small></button>
          <Link className="bottom-item" href="/login"><Fingerprint size={20} /><small>حسابي</small></Link>
        </nav>

        {toast && <div className="toast-message" role="status"><CheckCircle2 size={18} /><span>{toast}</span><button onClick={() => setToast("")} aria-label="إغلاق"><X size={15} /></button></div>}

        {formOpen && (
          <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}>
            <section className="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-form-title">
              <button className="modal-close" onClick={() => setFormOpen(false)} aria-label="إغلاق"><X size={19} /></button>
              <span className="section-kicker"><ShieldCheck size={14} /> بلاغ آمن</span>
              <h2 id="report-form-title">{kind === "lost" ? "سجّل مستمسكاً مفقوداً" : "سجّل مستمسكاً عثرت عليه"}</h2>
              <p>لا ترفع صورة المستمسك ولا تكتب رقمه أو أي بيانات شخصية حساسة.</p>
              <div className="kind-switch">
                <button className={kind === "lost" ? "active" : ""} onClick={() => setKind("lost")}>فقدت شيئاً</button>
                <button className={kind === "found" ? "active" : ""} onClick={() => setKind("found")}>عثرت على شيء</button>
              </div>
              <form onSubmit={(event) => void submitReport(event)} className="report-form">
                <label>نوع المستمسك أو الغرض<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label>المدينة<select value={formCity} onChange={(event) => setFormCity(event.target.value)}>{cities.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
                <label>المنطقة التقريبية <small>اختياري</small><input value={area} onChange={(event) => setArea(event.target.value)} maxLength={100} placeholder="مثلاً: الكرادة" /></label>
                <label>تفاصيل عامة غير حساسة <small>اختياري</small><textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={500} placeholder="اكتب وصفاً عاماً لا يكشف أرقاماً أو معلومات خاصة." /></label>
                <div className="privacy-warning"><ShieldCheck size={18} /><span>لا تكتب الرقم الوطني أو رقم البطاقة أو PIN أو CVV أو OTP.</span></div>
                <button className="form-submit" type="submit" disabled={busy}>{busy ? "جارٍ إرسال البلاغ..." : "إرسال البلاغ"} <ArrowUp size={17} /></button>
                <small className="form-footnote">يتطلب تسجيل الدخول. البلاغ لا يظهر للعامة قبل مراجعته ونشره.</small>
              </form>
            </section>
          </div>
        )}
      </div>
    </ClickSpark>
  );
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 56 56" fill="none">
        <rect x="10" y="7" width="29" height="40" rx="8" stroke="currentColor" strokeWidth="2.8" />
        <path d="M31 8v10h8" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 25h14M17 32h10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="39" cy="39" r="11" fill="#2ADDC0" stroke="#09272A" strokeWidth="2.5" />
        <path d="m34 39 3.2 3.2 6.3-7" stroke="#063638" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function LockKeyholeMini() {
  return <ShieldCheck size={15} />;
}
