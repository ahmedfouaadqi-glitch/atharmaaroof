"use client";

import dynamic from "next/dynamic";
import type { FormEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowUpLeft, BellRing, BookOpen, CheckCircle2, ChevronLeft,
  CircleHelp, FileText, Fingerprint, Globe, Layers3, MapPin, Navigation,
  Search, ShieldCheck, Sparkles, Users, CarFront
} from "lucide-react";
import { BrandMark } from "@/components/brand";
import VoiceAssistant from "@/components/VoiceAssistant";

const IraqInteractiveMap = dynamic(() => import("@/components/IraqInteractiveMap"), {
  ssr: false,
  loading: () => <div className="iraq-map-loading" role="status"><span /> جارٍ تحميل خريطة العراق...</div>
});

type Match = {
  id: string;
  title: string;
  city: string;
  area: string | null;
  public_code: string;
  kind: "lost" | "found";
};

type Props = {
  stageRef: RefObject<HTMLDivElement | null>;
  assistantText: string;
  setAssistantText: (value: string) => void;
  onAssistantSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onQuickSearch: (query: string) => void;
  assistantSearching: boolean;
  assistantReply: string;
  assistantMode: "ai" | "guided_search" | null;
  assistantMatches: Match[];
  onShowMatches: () => void;
  nearbySearching: boolean;
  nearbyError: string;
  onNearbySearch: () => void;
  motionStatus: "ready" | "enabled" | "unsupported" | string;
  onEnableMotion: () => void;
  onDisableMotion: () => void;
  onOpenReportForm: (kind: "lost" | "found") => void;
};

const shortcuts = [
  { label: "بطاقة وطنية", query: "بطاقة وطنية", Icon: Fingerprint },
  { label: "جواز سفر", query: "جواز سفر", Icon: Globe },
  { label: "رخصة قيادة", query: "رخصة قيادة", Icon: CarFront },
  { label: "مستندات أخرى", query: "مستندات أخرى", Icon: FileText }
];

const services = [
  { title: "ابحث عن مفقود", description: "استكشف البلاغات المنشورة", Icon: Search, tone: "aqua", action: "reports" },
  { title: "سجّل ما عثرت عليه", description: "أضف بلاغاً بخطوات واضحة", Icon: FileText, tone: "mint", action: "found" },
  { title: "أبلغ عن مفقود", description: "ساعد الآخرين على العثور عليه", Icon: MapPin, tone: "blue", action: "lost" },
  { title: "تابع البلاغات القريبة", description: "اعثر على نتائج حسب موقعك", Icon: BellRing, tone: "violet", action: "nearby" }
] as const;

const informationCards = [
  { href: "/about", title: "عن أثر معروف", description: "الفكرة، الهدف، وكيف تعمل الخدمة.", Icon: BookOpen, tone: "mint" },
  { href: "/privacy", title: "سياسة الخصوصية", description: "بياناتك وحقوقك وكيف نحميها.", Icon: ShieldCheck, tone: "blue" },
  { href: "/terms", title: "سياسة الاستخدام", description: "القواعد والمسؤوليات الأساسية.", Icon: Layers3, tone: "violet" },
  { href: "/faq", title: "الأسئلة الشائعة", description: "إجابات مختصرة عن أهم الاستفسارات.", Icon: CircleHelp, tone: "amber" }
] as const;

export default function AtharReferenceHome(props: Props) {
  const mapViewportRef = useRef<HTMLDivElement>(null);
  const [mapVisible, setMapVisible] = useState(false);

  useEffect(() => {
    const target = mapViewportRef.current;
    if (!target) { setMapVisible(true); return; }
    if (!("IntersectionObserver" in window)) { setMapVisible(true); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setMapVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "180px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="athar-rebuild" ref={props.stageRef} aria-label="أثر معروف — الصفحة الرئيسية" dir="rtl">
      <div className="ar-hero-grid">
        <div className="ar-map-panel">
          <div className="ar-panel-topline">
            <span className="ar-live"><i /> خريطة العراق</span>
            <span className="ar-map-count">٥ مدن محددة</span>
          </div>
          <div className="ar-map-stage" ref={mapViewportRef}>
            {mapVisible ? <IraqInteractiveMap /> : (
              <div className="iraq-map-placeholder">
                <MapPin size={30} />
                <strong>خريطة العراق التفاعلية</strong>
                <span>بغداد، كربلاء، النجف، سامراء، البصرة</span>
              </div>
            )}
            <div className="ar-map-label"><span>العراق</span><small>IRAQ</small></div>
          </div>
          <div className="ar-map-cities" aria-label="المدن المميزة">
            {["بغداد", "كربلاء", "النجف", "سامراء", "البصرة"].map((city) => <span key={city}><i />{city}</span>)}
          </div>
          <div className="ar-map-note"><ShieldCheck size={15} /> لا نعرض موقعك الدقيق للعامة، ومشاركة الموقع اختيارية.</div>
        </div>

        <div className="ar-hero-copy">
          <div className="ar-kicker"><span className="ar-kicker-icon"><Sparkles size={15} /></span><span>خدمة مجتمعية عراقية</span><span className="ar-kicker-line" /></div>
          <div className="ar-brand-heading">
            <div>
              <h1>أثر <em>معروف</em></h1>
              <h2>كل ما ضاع، <span>له أثر.</span></h2>
            </div>
            <div className="ar-brand-symbol" aria-hidden="true"><BrandMark /></div>
          </div>
          <p className="ar-hero-description">مساحة واحدة للبحث عن المفقودات والمعثورات، وإضافة البلاغات ومتابعتها بوضوح وأمان؛ لتقترب الأشياء من أصحابها.</p>

          <div className="ar-search-block">
            <div className="ar-search-label"><span><i /> ابدأ البحث</span><small>ابحث في البلاغات المنشورة</small></div>
            <div className="ar-search-row">
              <form className="ar-search-form" onSubmit={props.onAssistantSubmit}>
                <Search size={21} className="ar-search-leading" />
                <input
                  value={props.assistantText}
                  onChange={(event) => props.setAssistantText(event.target.value)}
                  placeholder="ما الذي تبحث عنه؟ اكتب نوع المستند أو المدينة..."
                  aria-label="البحث عن المفقودات والمعثورات"
                  maxLength={120}
                />
                <button type="submit" aria-label="بدء البحث" disabled={props.assistantSearching || props.assistantText.trim().length < 2}>
                  {props.assistantSearching ? <span className="assistant-spinner" /> : <ArrowLeft size={19} />}
                </button>
              </form>
              <div className="ar-voice-button"><VoiceAssistant /></div>
            </div>
            <div className="ar-privacy-hint"><ShieldCheck size={14} /><span>لا تكتب رقم الهوية أو أي بيانات سرية للمستند.</span></div>
          </div>

          <div className="ar-quick-search">
            <span>جرّب البحث عن</span>
            {shortcuts.map(({ label, query, Icon }) => <button key={query} type="button" onClick={() => props.onQuickSearch(query)}><Icon size={14} />{label}</button>)}
          </div>

          {props.assistantReply && (
            <section className="ar-assistant-response" aria-live="polite">
              <div className="ar-response-title"><CheckCircle2 size={17} /><b>{props.assistantMode === "ai" ? "مساعد أثر معروف" : "نتيجة البحث"}</b><small>{props.assistantMode === "ai" ? "رد المساعد" : "مطابقة مباشرة"}</small></div>
              <p>{props.assistantReply}</p>
              {props.assistantMatches.length > 0 && <>
                <div className="ar-response-matches">{props.assistantMatches.slice(0, 3).map((match) => (
                  <article key={match.id}><span>{match.kind === "found" ? <CheckCircle2 size={14} /> : <FileText size={14} />}</span><div><b>{match.title}</b><small>{match.city}{match.area ? " · " + match.area : ""} · {match.public_code}</small></div></article>
                ))}</div>
                <button type="button" className="ar-show-matches" onClick={props.onShowMatches}>عرض البلاغات المطابقة <ChevronLeft size={15} /></button>
              </>}
            </section>
          )}
        </div>
      </div>

      <section className="ar-service-section" aria-label="الخدمات">
        <div className="ar-section-heading"><div><span>خطوات واضحة</span><h2>كيف يمكننا مساعدتك؟</h2></div><p>اختر الخدمة التي تحتاجها للبدء.</p></div>
        <div className="ar-service-grid">
          {services.map(({ title, description, Icon, tone, action }, index) => (
            <button type="button" className={"ar-service-card " + tone} key={title} onClick={() => action === "reports" ? document.getElementById("reports")?.scrollIntoView({ behavior: "smooth" }) : action === "nearby" ? props.onNearbySearch() : props.onOpenReportForm(action)}>
              <span className="ar-service-number">0{index + 1}</span>
              <span className="ar-service-icon"><Icon size={23} strokeWidth={1.8} /></span>
              <span className="ar-service-copy"><b>{title}</b><small>{description}</small></span>
              <span className="ar-service-arrow"><ArrowUpLeft size={17} /></span>
            </button>
          ))}
        </div>
        {props.nearbyError && <p className="ar-nearby-error" role="alert">{props.nearbyError}</p>}
        <div className="ar-report-strip">
          <span className="ar-report-strip-copy"><span className="ar-report-pulse" /> لديك مستند مفقود أو عثرت على مستند؟</span>
          <button type="button" onClick={() => props.onOpenReportForm("lost")}>الإبلاغ عن مفقود <ArrowLeft size={16} /></button>
          <button type="button" onClick={() => props.onOpenReportForm("found")}>الإبلاغ عن معثور عليه <ArrowLeft size={16} /></button>
          <button type="button" className="ar-nearby-action" onClick={props.onNearbySearch} disabled={props.nearbySearching}>{props.nearbySearching ? <span className="assistant-spinner" /> : <Navigation size={16} />}{props.nearbySearching ? "جارٍ تحديد الموقع" : "اعرض القريب منك"}</button>
        </div>
      </section>

      {props.motionStatus !== "unsupported" && (
        <div className="ar-motion-setting">
          <span><Sparkles size={14} /> التفاعل الحركي اختياري</span>
          <button type="button" onClick={() => props.motionStatus === "enabled" ? props.onDisableMotion() : props.onEnableMotion()} aria-pressed={props.motionStatus === "enabled"}>{props.motionStatus === "enabled" ? "إيقاف الحركة" : "تفعيل حركة الجهاز"}</button>
        </div>
      )}

      <section className="ar-info-section" aria-label="معلومات وسياسات أثر معروف">
        <div className="ar-section-heading"><div><span>بكل وضوح</span><h2>تعرّف على أثر معروف</h2></div><p>معلومات موجزة وروابط واضحة لحقوقك وإرشادات الاستخدام.</p></div>
        <div className="ar-info-grid">{informationCards.map(({ href, title, description, Icon, tone }) => (
          <Link href={href} className={"ar-info-card " + tone} key={href}>
            <span className="ar-info-icon"><Icon size={21} /></span>
            <span className="ar-info-copy"><b>{title}</b><small>{description}</small></span>
            <ArrowUpLeft size={17} className="ar-info-arrow" />
          </Link>
        ))}</div>
      </section>
    </section>
  );
}
