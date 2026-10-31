"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { BrandMark } from "@/components/brand";
import { useDeviceMotion } from "@/components/useDeviceMotion";
import VoiceAssistant from "@/components/VoiceAssistant";
import { useInteractiveSound } from "@/components/useInteractiveSound";
import Link from "next/link";
import {
  ArrowUp, Bell, Check, CheckCircle2, ChevronLeft, Clock3,
  CreditCard, Download, FileText, Fingerprint, HeartHandshake, House,
  KeyRound, MapPin, MapPinned, Menu, Plus, Search, ShieldCheck,
  Smartphone, Sparkles, Volume2, VolumeX, Wallet, X, Navigation, LocateFixed, UserRoundCheck
} from "lucide-react";
import AtharReferenceHome from "@/components/AtharReferenceHome";
import ThemeToggle from "@/components/ThemeToggle";

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
  approx_distance_km?: number;
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

type BrowserLocation = { latitude: number; longitude: number };

function readBrowserLocation(): Promise<BrowserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("المتصفح لا يدعم تحديد الموقع."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) reject(new Error("لم تسمح بمشاركة موقعك. يمكنك البحث بالمدينة بدلاً من ذلك."));
        else if (error.code === error.TIMEOUT) reject(new Error("انتهت مهلة تحديد الموقع. حاول مرة أخرى."));
        else reject(new Error("تعذر تحديد الموقع. تحقق من إعدادات الجهاز."));
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
    );
  });
}

export default function HomePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const [city, setCity] = useState("الكل");
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [query, setQuery] = useState("");
  const [assistantText, setAssistantText] = useState("");
  const [assistantReply, setAssistantReply] = useState("");
  const [assistantMatches, setAssistantMatches] = useState<Report[]>([]);
  const [assistantMode, setAssistantMode] = useState<"ai" | "guided_search" | null>(null);
  const [assistantSearching, setAssistantSearching] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [kind, setKind] = useState<"lost" | "found">("lost");
  const [category, setCategory] = useState(categories[0]);
  const [formCity, setFormCity] = useState("بغداد");
  const [area, setArea] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [guestCode, setGuestCode] = useState("");
  const [guestStatus, setGuestStatus] = useState<"idle" | "pending" | "ready" | "error">("idle");
  const [guestMessage, setGuestMessage] = useState("");
  const [guestLinkOpen, setGuestLinkOpen] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestLinkBusy, setGuestLinkBusy] = useState(false);
  const [guestLinkMessage, setGuestLinkMessage] = useState("");
  const [reportLocation, setReportLocation] = useState<BrowserLocation | null>(null);
  const [reportLocationBusy, setReportLocationBusy] = useState(false);
  const [nearbyReports, setNearbyReports] = useState<Report[]>([]);
  const [nearbySearching, setNearbySearching] = useState(false);
  const [nearbyError, setNearbyError] = useState("");
  const [nearbyMessage, setNearbyMessage] = useState("");
  const [nearbyRadiusKm] = useState(5);
  const sound = useInteractiveSound();
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const deviceMotion = useDeviceMotion(heroVisualRef);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [reloadKey, setReloadKey] = useState(0);
  const toastTimer = useRef<number | null>(null);
  const autoMotionStarted = useRef(false);

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
    setReportLocation(null);
    setGuestMessage("");
    setGuestLinkOpen(false);
    setGuestLinkMessage("");
    setGuestEmail("");
    setGuestStatus("pending");
    void fetch("/api/guest/session", { method: "POST", cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "تعذر إنشاء هوية الزائر.");
        setGuestCode(payload.guestCode ?? "");
        setGuestStatus("ready");
        setGuestMessage(payload.recoverability ?? "");
      })
      .catch((error) => {
        setGuestStatus("error");
        setGuestMessage(error instanceof Error ? error.message : "تعذر إنشاء هوية الزائر.");
      });
  }

  useEffect(() => {
    let cancelled = false;
    async function loadReports() {
      setReportsLoading(true);
      setReportsError("");
      try {
        const params = new URLSearchParams({ limit: "24" });
        if (city !== "الكل") params.set("city", city);
        if (filter !== "all") params.set("kind", filter);
        const response = await fetch("/api/reports?" + params.toString(), { cache: "default" });
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
    let cancelled = false;
    let installTimer: number | null = null;
    let serviceWorkerTimer: number | null = null;
    let idleHandle: number | null = null;

    const userAgent = navigator.userAgent || "";
    const isIPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    const ios = /iPhone|iPad|iPod/i.test(userAgent) || isIPadOS;
    setIsIOSDevice(ios);

    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    let dismissed = false;
    try {
      dismissed = localStorage.getItem("athar-maaroof-install-dismissed") === "1";
    } catch {
      dismissed = false;
    }

    if (!standalone && !dismissed) {
      installTimer = window.setTimeout(() => {
        if (!cancelled) setShowInstallBanner(true);
      }, ios || window.matchMedia("(max-width: 1024px), (pointer: coarse)").matches ? 1600 : 4200);
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
      if (!dismissed && !standalone) setShowInstallBanner(true);
    };
    const onInstalled = () => {
      setShowInstallBanner(false);
      try { localStorage.setItem("athar-maaroof-installed", "1"); } catch { /* storage can be unavailable */ }
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    if ("serviceWorker" in navigator) {
      const register = () => {
        if (!cancelled) void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => undefined);
      };
      const idleWindow = window as Window & {
        requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
        cancelIdleCallback?: (handle: number) => void;
      };
      if (idleWindow.requestIdleCallback) idleHandle = idleWindow.requestIdleCallback(register, { timeout: 3500 });
      else serviceWorkerTimer = window.setTimeout(register, 900);
    }

    return () => {
      cancelled = true;
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      if (installTimer !== null) window.clearTimeout(installTimer);
      if (serviceWorkerTimer !== null) window.clearTimeout(serviceWorkerTimer);
      if (idleHandle !== null) {
        const idleWindow = window as Window & { cancelIdleCallback?: (handle: number) => void };
        idleWindow.cancelIdleCallback?.(idleHandle);
      }
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (deviceMotion.status === "ready" && !isIOSDevice && !autoMotionStarted.current) {
      autoMotionStarted.current = true;
      void deviceMotion.enable();
    }
  }, [deviceMotion.status, deviceMotion.enable, isIOSDevice]);

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

  async function runAssistantSearch(rawQuery: string) {
    const value = rawQuery.trim();
    if (!value || assistantSearching) return;

    setAssistantSearching(true);
    setAssistantReply("");
    setAssistantMatches([]);
    setAssistantMode(null);
    try {
      const response = await fetch("/api/assistant/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: value }),
        cache: "no-store"
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "تعذر تنفيذ البحث.");
      setAssistantReply(payload.assistant?.reply ?? "اكتمل البحث في البلاغات المنشورة.");
      setAssistantMode(payload.assistant?.mode ?? "guided_search");
      setAssistantMatches((payload.reports ?? []) as Report[]);
      setAssistantText(value);
    } catch (error) {
      setAssistantReply(error instanceof Error ? error.message : "تعذر الاتصال بالمساعد.");
      setAssistantMode("guided_search");
      setAssistantMatches([]);
    } finally {
      setAssistantSearching(false);
    }
  }

  function handleAssistantSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runAssistantSearch(assistantText);
  }

  async function searchNearbyReports() {
    setNearbySearching(true);
    setNearbyError("");
    setNearbyMessage("");
    try {
      const location = await readBrowserLocation();
      const response = await fetch("/api/reports/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: location.latitude, longitude: location.longitude, radiusKm: nearbyRadiusKm }),
        cache: "no-store"
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "تعذر البحث عن البلاغات القريبة.");
      const matches = (payload.reports ?? []) as Report[];
      setNearbyReports(matches);
      setNearbyMessage(matches.length === 0 ? "لم نعثر على بلاغات منشورة مرفق بها موقع تقريبي ضمن هذا النطاق. يمكنك توسيع النطاق أو البحث بالمدينة." : "");
      document.getElementById("reports")?.scrollIntoView({ behavior: "smooth", block: "start" });
      notify("اكتمل البحث القريب. لم نحفظ إحداثيات جهازك.", "success");
    } catch (error) {
      setNearbyError(error instanceof Error ? error.message : "تعذر تحديد موقعك.");
      setNearbyReports([]);
    } finally {
      setNearbySearching(false);
    }
  }

  async function attachApproximateReportLocation() {
    setReportLocationBusy(true);
    try {
      const location = await readBrowserLocation();
      setReportLocation(location);
      notify("تم التقاط موقع تقريبي لإرفاقه بالبلاغ بعد اختزاله على الخادم.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "تعذر تحديد الموقع.");
    } finally {
      setReportLocationBusy(false);
    }
  }

  async function enableDeviceMotion() {
    const enabled = await deviceMotion.enable();
    notify(
      enabled
        ? "تم تفعيل الاستجابة لحركة الجهاز. يمكنك إيقافها من إعدادات الموقع في المتصفح."
        : "لم يسمح المتصفح بقراءة حركة الجهاز. يمكنك الاستمرار باستخدام اللمس والمؤشر.",
      enabled ? "success" : "tap"
    );
  }

  function dismissInstallBanner() {
    setShowInstallBanner(false);
    try { localStorage.setItem("athar-maaroof-install-dismissed", "1"); } catch { /* storage can be unavailable */ }
  }

  async function linkGuestIdentity() {
    setGuestLinkBusy(true);
    setGuestLinkMessage("");
    try {
      const response = await fetch("/api/guest/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: guestEmail })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "تعذر ربط الهوية.");
      setGuestLinkMessage(payload.message ?? "تحقق من بريدك لإكمال ربط هوية الزائر.");
      notify("أرسلنا رابط تأكيد البريد.", "success");
    } catch (error) {
      setGuestLinkMessage(error instanceof Error ? error.message : "تعذر ربط هوية الزائر.");
    } finally {
      setGuestLinkBusy(false);
    }
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
          details,
          ...(reportLocation ? {
            locationLatitude: reportLocation.latitude,
            locationLongitude: reportLocation.longitude
          } : {})
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "تعذر حفظ البلاغ.");
      setFormOpen(false);
      setArea("");
      setDetails("");
      setCategory(categories[0]);
      setReportLocation(null);
      if (payload.guestCode) setGuestCode(payload.guestCode);
      setReloadKey((value) => value + 1);
      notify(payload.guest ? "تم استلام البلاغ وربطه بهوية زائر خاصة بهذا المتصفح." : "تم استلام البلاغ، وهو بانتظار مراجعة المشرف قبل نشره.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "تعذر حفظ البلاغ. حاول لاحقاً.");
    } finally {
      setBusy(false);
    }
  }

  async function installApplication() {
    if (!installPrompt) {
      setShowInstallHelp((value) => !value);
      setShowInstallBanner(true);
      return;
    }
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (choice.outcome === "accepted") {
        setShowInstallBanner(false);
        try { localStorage.setItem("athar-maaroof-installed", "1"); } catch { /* storage can be unavailable */ }
        notify("تم إرسال طلب تثبيت أثر معروف.", "success");
      } else {
        notify("يمكنك تثبيت التطبيق لاحقاً من قائمة المتصفح.");
      }
    } catch {
      setShowInstallHelp(true);
      notify("تعذر فتح نافذة التثبيت. استخدم خيار الإضافة إلى الشاشة الرئيسية.");
    }
  }

  const reportStatus = (status: string) => {
    if (status === "published") return "منشور";
    if (status === "matched") return "تطابق محتمل";
    if (status === "returned") return "تمت الإعادة";
    return "غير متاح";
  };

  return (
    <div className="app-shell" dir="rtl" onClickCapture={sound.onInteraction} onPointerOverCapture={sound.onHover} onContextMenuCapture={(event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable=true]")) return;
        event.preventDefault();
      }}>
        <div className="ambient ambient-one" aria-hidden="true" />
        <div className="ambient ambient-two" aria-hidden="true" />

        <header className="topbar" id="home">
          <Link href="/" className="brand-lockup" aria-label="أثر معروف — الصفحة الرئيسية">
            <BrandMark />
            <span className="brand-copy">
              <strong>أثر <b>معروف</b></strong>
              <small>كل ما ضاع، له أثر</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            <button className={activeNav === "home" ? "nav-link active" : "nav-link"} onClick={() => scrollTo("home", "home")}>الرئيسية</button>
            <button className={activeNav === "reports" ? "nav-link active" : "nav-link"} onClick={() => scrollTo("reports", "reports")}>البلاغات</button>
            <button className={activeNav === "safety" ? "nav-link active" : "nav-link"} onClick={() => scrollTo("safety", "safety")}>الأمان والخصوصية</button>
          </nav>

          <div className="header-actions">
            <ThemeToggle compact />
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
              <Link href="/about"><BookOpen size={17} /> عن المبادرة</Link>
              <Link href="/privacy"><ShieldCheck size={17} /> سياسة الخصوصية</Link>
              <Link href="/terms"><FileText size={17} /> سياسة الاستخدام</Link>
              <Link href="/faq"><CircleHelp size={17} /> الأسئلة الشائعة</Link>
              <Link href="/login"><Fingerprint size={17} /> حسابي وتسجيل الدخول</Link>
            </div>
          )}
        </header>

        {showInstallBanner && (
          <aside className="install-banner" aria-label="تثبيت أثر معروف">
            <span className="install-banner-icon"><BrandMark /></span>
            <div className="install-banner-copy">
              <strong>ثبّت أثر معروف على جهازك</strong>
              <small>{isIOSDevice ? "في Safari اضغط مشاركة ثم «إضافة إلى الشاشة الرئيسية»." : "افتح التطبيق من الشاشة الرئيسية بسرعة، من دون البحث عنه كل مرة."}</small>
            </div>
            <button className="install-banner-cta" onClick={() => void installApplication()}>
              <Download size={15} /> تثبيت
            </button>
            <button className="install-banner-close" onClick={dismissInstallBanner} aria-label="إخفاء اقتراح التثبيت"><X size={16} /></button>
          </aside>
        )}
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
          <AtharReferenceHome
            stageRef={heroVisualRef}
            assistantText={assistantText}
            setAssistantText={setAssistantText}
            onAssistantSubmit={handleAssistantSubmit}
            onQuickSearch={(value) => { setAssistantText(value); void runAssistantSearch(value); }}
            assistantSearching={assistantSearching}
            assistantReply={assistantReply}
            assistantMode={assistantMode}
            assistantMatches={assistantMatches}
            onShowMatches={() => {
              setReports(assistantMatches);
              setQuery("");
              scrollTo("reports", "reports");
            }}
            nearbySearching={nearbySearching}
            nearbyError={nearbyError}
            onNearbySearch={() => void searchNearbyReports()}
            motionStatus={deviceMotion.status}
            onEnableMotion={() => void enableDeviceMotion()}
            onDisableMotion={deviceMotion.disable}
            onOpenReportForm={openReportForm}
          />

          <section className="reports-section reveal" id="reports">
            <div className="section-heading">
              <div>
                <span className="section-kicker"><MapPinned size={14} /> من المجتمع</span>
                <h2>بلاغات المفقودات والمعثورات</h2>
                <p>تظهر هنا البلاغات التي نُشرت بعد مراجعتها، دون بيانات اتصال شخصية.</p>
              </div>
              <button className="text-button" onClick={() => { setCity("الكل"); setFilter("all"); setQuery("");  }}>إعادة ضبط <X size={15} /></button>
            </div>

            {nearbyReports.length > 0 && (
              <section className="nearby-results" aria-live="polite">
                <div className="nearby-results-heading">
                  <span><Navigation size={16} /> بلاغات قريبة منك</span>
                  <small>داخل نطاق {nearbyRadiusKm} كم · المسافة تقريبية</small>
                  <button type="button" onClick={() => { setNearbyReports([]); setNearbyMessage(""); }} aria-label="إخفاء البلاغات القريبة"><X size={15} /></button>
                </div>
                {nearbyReports.map((report) => (
                  <article className="nearby-result-item" key={report.id}>
                    <span className="nearby-result-icon"><MapPin size={17} /></span>
                    <div><b>{report.title}</b><small>{report.city}{report.area ? " · " + report.area : ""} · {report.public_code}</small></div>
                    <strong>{report.approx_distance_km !== undefined ? (report.approx_distance_km < 1 ? "أقل من 1 كم" : "نحو " + report.approx_distance_km + " كم") : ""}</strong>
                  </article>
                ))}
              </section>
            )}
            {nearbyError && <p className="nearby-inline-error" role="alert">{nearbyError}</p>}
            {nearbyMessage && <p className="nearby-empty-message">{nearbyMessage}</p>}
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
            <button onClick={() => void installApplication()}><Download size={16} /> تثبيت التطبيق</button>
          </section>

          <footer className="site-footer">
            <div className="footer-brand"><BrandMark /><span><b>أثر معروف</b><small>منصة عراقية للمفقودات والمعثورات</small></span></div>
            <span>© {new Date().getFullYear()} أثر معروف. جميع الحقوق محفوظة.</span>
            <nav className="footer-links">
              <Link href="/about">عن المبادرة</Link>
              <Link href="/privacy">سياسة الخصوصية</Link>
              <Link href="/terms">شروط الاستخدام</Link>
              <Link href="/faq">الأسئلة الشائعة</Link>
            </nav>
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
                <div className="report-location-choice">
                  <div><LocateFixed size={17} /><span><b>موقع تقريبي للبلاغ</b><small>اختياري. لا يُرفق إلا بموافقتك، ويُختزل إلى نطاق تقريبي.</small></span></div>
                  <button type="button" onClick={() => void attachApproximateReportLocation()} disabled={reportLocationBusy}>
                    {reportLocationBusy ? "جارٍ تحديد الموقع..." : reportLocation ? "تم إرفاق الموقع" : "مشاركة موقع تقريبي"}
                  </button>
                  {reportLocation && <small className="location-selected"><ShieldCheck size={12} /> تم التقاط الإحداثيات. سيخزن الخادم تقريباً على مستوى كيلومتر، وليس موقعك الدقيق.</small>}
                </div>
                <div className="guest-session-note">
                  <UserRoundCheck size={16} />
                  <span>
                    <b>{guestStatus === "pending" ? "جارٍ إعداد هوية زائر..." : guestStatus === "ready" ? (guestCode ? "تم إنشاء هوية زائر تلقائياً" : "تم استخدام حسابك المسجل") : guestStatus === "error" ? "تعذر إعداد هوية الزائر" : "لا تحتاج إلى تسجيل دخول لإرسال البلاغ"}</b>
                    <small>{guestCode ? "معرّفك: " + guestCode + " · " : ""}{guestMessage || "تظل الجلسة مرتبطة بهذا المتصفح. اربطها بوسيلة دخول دائمة لاستعادتها بعد حذف البيانات."}</small>
                  </span>
                </div>
                {guestCode && (
                  <div className="guest-recovery">
                    <button type="button" className="guest-recovery-toggle" onClick={() => setGuestLinkOpen((value) => !value)}>
                      {guestLinkOpen ? "إغلاق حفظ الهوية" : "حفظ هويتي لاستعادتها من جهاز آخر"}
                    </button>
                    {guestLinkOpen && (
                      <div className="guest-recovery-form">
                        <p>أضف بريدك وأكّد الرسالة التي تصلك. بعد التأكيد تستطيع استعادة هذه الهوية عبر البريد دون فقدان البلاغات المرتبطة بها.</p>
                        <input type="email" required value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} placeholder="بريدك الإلكتروني" autoComplete="email" />
                        <button type="button" onClick={() => void linkGuestIdentity()} disabled={guestLinkBusy || !guestEmail.trim()}>{guestLinkBusy ? "جارٍ الإرسال..." : "إرسال رابط التأكيد"}</button>
                        {guestLinkMessage && <small role="status">{guestLinkMessage}</small>}
                      </div>                    )}
                  </div>
                )}
                <div className="privacy-warning"><ShieldCheck size={18} /><span>لا تكتب الرقم الوطني أو رقم البطاقة أو PIN أو CVV أو OTP.</span></div>
                <button className="form-submit" type="submit" disabled={busy}>{busy ? "جارٍ إرسال البلاغ..." : "إرسال البلاغ"} <ArrowUp size={17} /></button>
                <small className="form-footnote">لا يتطلب تسجيل دخول تقليدي. البلاغ لا يظهر للعامة قبل مراجعته ونشره.</small>
              </form>
            </section>
          </div>
        )}
    </div>
  );
}

function LockKeyholeMini() {
  return <ShieldCheck size={15} />;
}
