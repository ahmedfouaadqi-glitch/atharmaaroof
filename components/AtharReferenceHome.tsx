"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  FileText,
  Fingerprint,
  Globe,
  MapPin,
  MapPinned,
  Navigation,
  Search,
  ShieldCheck
} from "lucide-react";
import VoiceAssistant from "@/components/VoiceAssistant";

type Match = {
  id: string;
  title: string;
  city: string;
  area: string | null;
  public_code: string;
  kind: "lost" | "found";
};

type Props = {
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
  onOpenReportForm: (kind: "lost" | "found") => void;
};

const searchShortcuts = [
  { label: "بطاقة وطنية", query: "بطاقة وطنية", Icon: Fingerprint },
  { label: "جواز سفر", query: "جواز سفر", Icon: Globe },
  { label: "إجازة قيادة", query: "إجازة قيادة", Icon: FileText },
  { label: "بطاقة سكن", query: "بطاقة سكن", Icon: MapPin }
];

const informationLinks = [
  {
    href: "/about",
    title: "عن المبادرة",
    description: "كيف تعمل الخدمة وما حدود دورها.",
    Icon: BookOpen
  },
  {
    href: "/privacy",
    title: "الخصوصية",
    description: "البيانات التي نستخدمها وخياراتك.",
    Icon: ShieldCheck
  },
  {
    href: "/terms",
    title: "شروط الاستخدام",
    description: "ضوابط نشر البلاغات واستخدام الخدمة.",
    Icon: BadgeCheck
  },
  {
    href: "/faq",
    title: "مركز المساعدة",
    description: "إجابات مباشرة عن الأسئلة الشائعة.",
    Icon: CircleHelp
  }
];

export default function AtharReferenceHome(props: Props) {
  const [selectedShortcut, setSelectedShortcut] = useState("");

  return (
    <section
      className="athar-rebuild"
      aria-label="أثر معروف — الصفحة الرئيسية"
      dir="rtl"
    >
      <section className="ar-editorial-hero" aria-labelledby="athar-home-title">
        <div className="ar-intro-copy">
          <div className="ar-overline">
            <span className="ar-overline-mark" />
            <span>خدمة مجتمعية مستقلة</span>
            <span className="ar-overline-divider" />
            <span>العراق</span>
            <span className="ar-hero-reference">01 / 03</span>
          </div>

          <h1 id="athar-home-title">
            ابحث عن مستندك.
            <em> فقد يكون له أثر.</em>
          </h1>

          <p className="ar-intro-lead">
            يجمع «أثر معروف» بلاغات المستندات المفقودة والمعثورة في مكان واحد،
            لتسهيل البحث والوصول إلى المعلومات المنشورة.
          </p>

          <div className="ar-trust-rail" aria-label="إرشادات الخصوصية">
            <span><i /> لا ترفع صورة المستند</span>
            <span><i /> لا تكتب رقمه الكامل</span>
            <span><i /> الموقع اختياري</span>
          </div>
        </div>

        <aside className="ar-search-panel" aria-label="البحث في البلاغات">
          <div className="ar-panel-heading">
            <div>
              <span className="ar-panel-kicker">البحث / 01</span>
              <h2>ابحث في البلاغات المنشورة</h2>
            </div>
            <span className="ar-panel-icon"><Search size={19} /></span>
          </div>

          <p className="ar-search-instruction">
            اكتب نوع المستند أو المدينة أو المنطقة. لا تدخل أرقاماً أو بيانات شخصية.
          </p>

          <form className="ar-search-form" onSubmit={props.onAssistantSubmit}>
            <Search size={19} className="ar-search-leading" aria-hidden="true" />
            <input
              value={props.assistantText}
              onChange={(event) => props.setAssistantText(event.target.value)}
              placeholder="مثال: بطاقة وطنية في الكرادة"
              aria-label="البحث عن المفقودات والمعثورات"
              maxLength={120}
            />
            <button
              type="submit"
              aria-label="بدء البحث"
              disabled={props.assistantSearching || props.assistantText.trim().length < 2}
            >
              {props.assistantSearching
                ? <span className="assistant-spinner" />
                : <ArrowLeft size={19} />}
            </button>
          </form>

          <div className="ar-search-support">
            <span><ShieldCheck size={14} /> تظهر البلاغات المنشورة فقط</span>
            <div className="ar-voice-button"><VoiceAssistant /></div>
          </div>

          <div className="ar-search-shortcuts" aria-label="بحث سريع حسب نوع المستند">
            {searchShortcuts.map(({ label, query, Icon }) => (
              <button
                type="button"
                key={query}
                className={selectedShortcut === query ? "selected" : ""}
                onClick={() => {
                  setSelectedShortcut(query);
                  props.onQuickSearch(query);
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {props.assistantReply && (
            <section className="ar-assistant-response" aria-live="polite">
              <div className="ar-response-title">
                <CheckCircle2 size={16} />
                <b>{props.assistantMode === "ai" ? "رد المساعد" : "نتيجة البحث"}</b>
                <small>{props.assistantMatches.length} نتيجة</small>
              </div>
              <p>{props.assistantReply}</p>
              {props.assistantMatches.length > 0 && (
                <div className="ar-response-matches">
                  {props.assistantMatches.slice(0, 3).map((match) => (
                    <article key={match.id}>
                      <span>{match.kind === "found" ? <BadgeCheck size={15} /> : <FileText size={15} />}</span>
                      <div>
                        <b>{match.title}</b>
                        <small>{match.city}{match.area ? " · " + match.area : ""} · {match.public_code}</small>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {props.assistantMatches.length > 0 && (
                <button type="button" className="ar-show-matches" onClick={props.onShowMatches}>
                  عرض النتائج في سجل البلاغات <ArrowUpLeft size={15} />
                </button>
              )}
            </section>
          )}
        </aside>
      </section>

      <section className="ar-action-section" aria-labelledby="ar-action-title">
        <div className="ar-section-heading">
          <div>
            <span className="ar-section-index">02 / الإجراء التالي</span>
            <h2 id="ar-action-title">ماذا تريد أن تفعل؟</h2>
          </div>
          <a href="#reports" className="ar-text-link">
            تصفّح جميع البلاغات <ArrowLeft size={15} />
          </a>
        </div>

        <div className="ar-action-grid">
          <button
            type="button"
            className="ar-action-card ar-action-lost"
            onClick={() => props.onOpenReportForm("lost")}
          >
            <span className="ar-action-count">01</span>
            <span className="ar-action-icon"><Search size={21} /></span>
            <span className="ar-action-copy">
              <b>أبلغ عن مستند مفقود</b>
              <small>أنشئ بلاغاً بمعلومات عامة وآمنة.</small>
            </span>
            <ArrowUpLeft className="ar-action-arrow" size={19} />
          </button>

          <button
            type="button"
            className="ar-action-card ar-action-found"
            onClick={() => props.onOpenReportForm("found")}
          >
            <span className="ar-action-count">02</span>
            <span className="ar-action-icon"><FileText size={21} /></span>
            <span className="ar-action-copy">
              <b>سجّل مستنداً عثرت عليه</b>
              <small>ساعد صاحبه على الوصول إليه دون كشف بياناته.</small>
            </span>
            <ArrowUpLeft className="ar-action-arrow" size={19} />
          </button>
        </div>
      </section>

      <section className="ar-location-band" aria-label="البحث حسب الموقع">
        <div className="ar-location-icon"><Navigation size={21} /></div>
        <div className="ar-location-copy">
          <span className="ar-panel-kicker">03 / بحث اختياري</span>
          <h2>اعرض البلاغات القريبة منك</h2>
          <p>لا يُطلب موقعك إلا بعد اختيارك. ويمكنك استخدام البحث بالمدينة دون مشاركة الموقع.</p>
        </div>
        <div className="ar-location-action">
          <span className="ar-location-state"><i /> موقعك لا يُشارك تلقائياً</span>
          <button type="button" onClick={props.onNearbySearch} disabled={props.nearbySearching}>
            {props.nearbySearching ? "جارٍ تحديد الموقع..." : "تحديد موقعي"}
            {props.nearbySearching ? <span className="assistant-spinner" /> : <MapPinned size={16} />}
          </button>
        </div>
        {props.nearbyError && <p className="ar-nearby-error" role="alert">{props.nearbyError}</p>}
      </section>

      <section className="ar-information-section" aria-label="معلومات أثر معروف">
        <div className="ar-section-heading">
          <div>
            <span className="ar-section-index">معلومات الخدمة</span>
            <h2>استخدم الخدمة بوضوح واطمئنان</h2>
          </div>
        </div>
        <div className="ar-information-links">
          {informationLinks.map(({ href, title, description, Icon }) => (
            <Link href={href} className="ar-information-link" key={href}>
              <span className="ar-information-icon"><Icon size={17} /></span>
              <span className="ar-information-copy">
                <b>{title}</b>
                <small>{description}</small>
              </span>
              <ArrowUpLeft size={16} className="ar-information-arrow" />
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
