"use client";

import dynamic from "next/dynamic";
import type { FormEvent, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpLeft, BookOpen, CheckCircle2, ChevronLeft, CircleHelp, FileText,
  Fingerprint, Globe, MapPin, Navigation, Scale, Search, ShieldCheck,
  Smartphone, Sparkles, CarFront, ArrowLeft, Layers3, Users, ChartNoAxesColumnIncreasing
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
  { title: "استكشاف البلاغات", description: "ابحث عن مستند مفقود أو معثور عليه", Icon: Search, tone: "cyan", action: "reports" },
  { title: "خدمة المجتمع", description: "ساهم في إعادة المستندات لأصحابها", Icon: Users, tone: "mint", action: "found" },
  { title: "توثيق المبادرات", description: "بلاغات منظمة ومعلومات واضحة", Icon: Layers3, tone: "blue", action: "lost" },
  { title: "دعم القرار", description: "نتائج بحث ومؤشرات مفهومة", Icon: ChartNoAxesColumnIncreasing, tone: "violet", action: "reports" }
] as const;

const informationCards = [
  { href: "/about", title: "عن المبادرة", description: "رسالتنا وأهدافنا وخدمة المجتمع.", Icon: BookOpen, tone: "mint" },
  { href: "/privacy", title: "سياسة الخصوصية", description: "كيف نتعامل مع بياناتك.", Icon: ShieldCheck, tone: "blue" },
  { href: "/terms", title: "سياسة الاستخدام", description: "الحقوق والمسؤوليات وضوابط البلاغات.", Icon: Scale, tone: "violet" },
  { href: "/faq", title: "الأسئلة الشائعة", description: "إجابات واضحة عن استخدام المنصة.", Icon: CircleHelp, tone: "amber" }
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
    <section className="athar-home reveal" ref={props.stageRef} aria-label="أثر معروف — الصفحة الرئيسية">
      <div className="athar-home-grid">
        <div className="athar-home-map-column">
          <div className="athar-map-caption">
            <span className="athar-live-dot" />
            <span>خريطة العراق التفاعلية</span>
            <small>خمسة مواقع مميزة</small>
          </div>
          <div className="athar-home-map" ref={mapViewportRef}>
            {mapVisible ? <IraqInteractiveMap /> : (
              <div className="iraq-map-placeholder">
                <MapPin size={28} />
                <strong>خريطة العراق التفاعلية</strong>
                <span>تظهر بغداد وكربلاء والنجف وسامراء والبصرة فقط كمواقع مميزة.</span>
              </div>
            )}
            <div className="athar-map-overlay-label"><span>العراق</span><small>IRAQ</small></div>
          </div>
          <div className="athar-map-legend">
            <span><i /> بغداد</span><span><i /> كربلاء</span><span><i /> النجف</span><span><i /> سامراء</span><span><i /> البصرة</span>
          </div>
          <div className="athar-map-footnote"><ShieldCheck size={14} /> الموقع الدقيق لا يظهر للعامة، ومشاركة موقعك اختيارية.</div>
        </div>

        <div className="athar-home-main">
          <div className="athar-home-eyebrow"><span><Sparkles size={14} /> مبادرة أثر معروف</span><span className="athar-home-status">منصة مجتمعية عراقية</span></div>
          <div className="athar-home-title-row">
            <div>
              <h1>منصة ذكية لخدمة المجتمع<br />وتطوير <em>الأثر</em> في العراق</h1>
              <p className="athar-home-lede">مساعد ذكي يساعدك على البحث عن المفقودات والمعثورات، ويربط البلاغات بالمعلومات المتاحة لتسهيل وصول المستندات إلى أصحابها.</p>
            </div>
            <div className="athar-home-brand-stamp" aria-hidden="true"><BrandMark className="athar-home-logo" /></div>
          </div>

          <div className="athar-assistant-label"><span className="athar-live-dot" /> ابدأ من هنا <small>المساعد الذكي</small></div>
          <div className="athar-assistant-row">
            <form className="athar-assistant-search" onSubmit={props.onAssistantSubmit}>
              <Sparkles className="athar-search-spark" size={23} />
              <input
                value={props.assistantText}
                onChange={(event) => props.setAssistantText(event.target.value)}
                placeholder="اسأل المساعد عن مستند مفقود، بلاغ، أو مدينة..."
                aria-label="اسأل المساعد الذكي عن المفقودات والمعثورات"
                maxLength={120}
              />
              <button type="submit" aria-label="إرسال السؤال" disabled={props.assistantSearching || props.assistantText.trim().length < 2}>
                {props.assistantSearching ? <span className="assistant-spinner" /> : <ArrowLeft size={20} />}
              </button>
            </form>
            <div className="athar-call-button"><VoiceAssistant /></div>
          </div>
          <div className="athar-search-hint"><span><ShieldCheck size={13} /> البحث في البلاغات المنشورة</span><small>لا تدخل أرقام الهوية أو بيانات المستندات السرية</small></div>

          {props.assistantReply && (
            <section className="athar-assistant-response" aria-live="polite">
              <div className="athar-response-heading"><CheckCircle2 size={17} /><b>{props.assistantMode === "ai" ? "مساعد أثر معروف" : "نتيجة البحث"}</b><small>{props.assistantMode === "ai" ? "رد المساعد" : "مطابقة مباشرة"}</small></div>
              <p>{props.assistantReply}</p>
              {props.assistantMatches.length > 0 && <>
                <div className="athar-response-matches">{props.assistantMatches.slice(0, 3).map((match) => (
                  <article key={match.id}><span>{match.kind === "found" ? <CheckCircle2 size={14} /> : <FileText size={14} />}</span><div><b>{match.title}</b><small>{match.city}{match.area ? " · " + match.area : ""} · {match.public_code}</small></div></article>
                ))}</div>
                <button type="button" className="athar-show-matches" onClick={props.onShowMatches}>عرض البلاغات المطابقة <ChevronLeft size={15} /></button>
              </>}
            </section>
          )}

          <div className="athar-quick-searches">
            <b>أمثلة للبحث:</b>
            {shortcuts.map(({ label, query, Icon }) => <button key={query} type="button" onClick={() => props.onQuickSearch(query)}><Icon size={14} />{label}</button>)}
          </div>

          <div className="athar-home-services">
            {services.map(({ title, description, Icon, tone, action }) => (
              <button type="button" className={"athar-service-card " + tone} key={title} onClick={() => action === "reports" ? document.getElementById("reports")?.scrollIntoView({ behavior: "smooth" }) : props.onOpenReportForm(action)}>
                <span className="athar-service-icon"><Icon size={25} strokeWidth={1.8} /></span>
                <span className="athar-service-copy"><b>{title}</b><small>{description}</small></span>
                <ChevronLeft size={17} className="athar-service-arrow" />
              </button>
            ))}
          </div>

          <div className="athar-report-actions">
            <button type="button" className="athar-report-lost" onClick={() => props.onOpenReportForm("lost")}><Search size={17} /> فقدت مستنداً</button>
            <button type="button" className="athar-report-found" onClick={() => props.onOpenReportForm("found")}><FileText size={17} /> عثرت على مستند</button>
            <button type="button" className="athar-report-nearby" onClick={props.onNearbySearch} disabled={props.nearbySearching}>{props.nearbySearching ? <span className="assistant-spinner" /> : <Navigation size={16} />}{props.nearbySearching ? "جارٍ تحديد الموقع" : "بلاغات قريبة"}</button>
          </div>
          {props.nearbyError && <p className="athar-nearby-error" role="alert">{props.nearbyError}</p>}
        </div>
      </div>

      {props.motionStatus !== "unsupported" && (
        <div className="athar-motion-setting">
          <span><Smartphone size={14} /> حركة الجهاز اختيارية</span>
          <button type="button" onClick={() => props.motionStatus === "enabled" ? props.onDisableMotion() : props.onEnableMotion()} aria-pressed={props.motionStatus === "enabled"}>{props.motionStatus === "enabled" ? "إيقاف الحركة" : "تفعيل حركة الجهاز"}</button>
        </div>
      )}

      <section className="athar-info-area" aria-label="معلومات المنصة">
        <div className="athar-info-heading"><div><span>مساحة واضحة وآمنة</span><h2>كل ما تحتاج معرفته عن أثر معروف</h2></div><p>معلومات مختصرة، وسياسات منظمة، وتجربة مصممة لتسهيل الاستخدام.</p></div>
        <div className="athar-info-grid">{informationCards.map(({ href, title, description, Icon, tone }) => (
          <Link href={href} className={"athar-info-card " + tone} key={href}>
            <span className="athar-info-icon"><Icon size={23} /></span><span className="athar-info-copy"><b>{title}</b><small>{description}</small></span><ChevronLeft size={17} className="athar-info-arrow" />
          </Link>
        ))}</div>
      </section>
    </section>
  );
}
