"use client";

import type { FormEvent, RefObject } from "react";
import Link from "next/link";
import {
  CarFront, CheckCircle2, ChevronLeft, FileText, Fingerprint,
  Globe, MapPin, Navigation, Search, ShieldCheck, Smartphone
} from "lucide-react";
import { BrandMark } from "@/components/brand";
import VoiceAssistant from "@/components/VoiceAssistant";
import IraqNightMap from "@/components/IraqNightMap";

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
  motionStatus: string;
  onEnableMotion: () => void;
  onDisableMotion: () => void;
  onOpenReportForm: (kind: "lost" | "found") => void;
};

const shortcuts = [
  { label: "بحث بالمفقودات", query: "مفقود", Icon: Search },
  { label: "بطاقة وطنية", query: "بطاقة وطنية", Icon: Fingerprint },
  { label: "جواز سفر", query: "جواز سفر", Icon: Globe },
  { label: "رخصة قيادة", query: "رخصة قيادة", Icon: CarFront },
  { label: "مستندات أخرى", query: "مستندات أخرى", Icon: FileText }
];

export default function AtharReferenceHome(props: Props) {
  return (
    <section className="athar-v2-stage reveal" ref={props.stageRef} aria-label="أثر معروف — الصفحة الرئيسية">
      <div className="athar-v2-atmosphere" aria-hidden="true" />

      <div className="athar-v2-documents" aria-hidden="true">
        <article className="athar-v2-document doc-passport">
          <small>جواز سفر</small>
          <div className="athar-v2-doc-art"><Globe size={36} strokeWidth={1.2} /></div>
          <div className="athar-v2-doc-lines"><i /><i /><i /></div>
          <span className="athar-v2-doc-code">PASSPORT</span>
        </article>
        <article className="athar-v2-document doc-national">
          <small>بطاقة وطنية</small>
          <div className="athar-v2-doc-art"><Fingerprint size={34} strokeWidth={1.25} /></div>
          <div className="athar-v2-doc-lines"><i /><i /></div>
          <span className="athar-v2-doc-code">IRAQ ID</span>
        </article>
        <article className="athar-v2-document doc-license">
          <small>رخصة قيادة</small>
          <div className="athar-v2-doc-art"><CarFront size={37} strokeWidth={1.25} /></div>
          <div className="athar-v2-doc-lines"><i /><i /></div>
          <span className="athar-v2-doc-code">DRIVING</span>
        </article>
        <article className="athar-v2-document doc-other">
          <small>مستندات أخرى</small>
          <div className="athar-v2-doc-art"><FileText size={35} strokeWidth={1.25} /></div>
          <div className="athar-v2-doc-lines"><i /><i /><i /></div>
          <span className="athar-v2-doc-code">DOCUMENT</span>
        </article>
      </div>

      <div className="athar-v2-brand">
        <BrandMark className="athar-v2-brand-mark" />
        <h1>أثر <b>معروف</b></h1>
        <span className="athar-v2-english">ATHAR MAAROOF</span>
        <p>لأن كل شيء له أثر... ونوصله لأصحابه</p>
      </div>

      <div className="athar-v2-search-area">
        <div className="athar-v2-search-wrap">
          <div className="athar-v2-voice"><VoiceAssistant /></div>
          <form className="athar-v2-search" onSubmit={props.onAssistantSubmit}>
            <input
              value={props.assistantText}
              onChange={(event) => props.setAssistantText(event.target.value)}
              placeholder="ابحث أو تحدث مع المساعد الذكي..."
              aria-label="ابحث في المفقودات والمعثورات"
              maxLength={120}
            />
            <button
              type="submit"
              aria-label="البحث في البلاغات"
              disabled={props.assistantSearching || props.assistantText.trim().length < 2}
            >
              {props.assistantSearching ? <span className="assistant-spinner" /> : <Search size={23} />}
            </button>
          </form>
        </div>

        <div className="athar-v2-search-note">
          <span><ShieldCheck size={12} /> بحث في البلاغات المنشورة</span>
          <small>لا تُدخل أرقام الهوية أو بيانات المستندات السرية</small>
        </div>

        {props.assistantReply && (
          <section className="athar-v2-assistant-response" aria-live="polite">
            <div className="athar-v2-response-head">
              <span><CheckCircle2 size={15} /></span>
              <b>{props.assistantMode === "ai" ? "مساعد أثر معروف" : "نتيجة البحث في البلاغات"}</b>
              <small>{props.assistantMode === "ai" ? "رد المساعد" : "مطابقة مباشرة"}</small>
            </div>
            <p>{props.assistantReply}</p>
            {props.assistantMatches.length > 0 && (
              <>
                <div className="athar-v2-response-matches">
                  {props.assistantMatches.slice(0, 3).map((match) => (
                    <article key={match.id}>
                      <span>{match.kind === "found" ? <CheckCircle2 size={14} /> : <FileText size={14} />}</span>
                      <div>
                        <b>{match.title}</b>
                        <small>{match.city}{match.area ? " · " + match.area : ""} · {match.public_code}</small>
                      </div>
                    </article>
                  ))}
                </div>
                <button type="button" className="athar-v2-show-matches" onClick={props.onShowMatches}>
                  عرض البلاغات المطابقة <ChevronLeft size={15} />
                </button>
              </>
            )}
          </section>
        )}

        <div className="athar-v2-shortcuts" aria-label="عمليات البحث السريعة">
          {shortcuts.map(({ label, query, Icon }) => (
            <button key={query} type="button" onClick={() => props.onQuickSearch(query)}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="athar-v2-map-section">
        <IraqNightMap />
        <div className="athar-v2-map-shade" aria-hidden="true" />
        <aside className="athar-v2-map-card privacy-card">
          <div className="athar-v2-map-card-head">
            <span className="athar-v2-map-card-icon"><ShieldCheck size={27} /></span>
            <b>خصوصيتك أولاً</b>
          </div>
          <p>موقعك يُستخدم فقط لعرض البلاغات القريبة منك وبموافقتك.</p>
          <Link href="/privacy">معرفة المزيد <ChevronLeft size={13} /></Link>
        </aside>

        <aside className="athar-v2-map-card nearby-card">
          <div className="athar-v2-map-card-head">
            <span className="athar-v2-map-card-icon"><MapPin size={25} /></span>
            <b>اكتشاف البلاغات القريبة</b>
          </div>
          <p>بموافقتك نعرض لك البلاغات الأقرب إلى موقعك الحالي.</p>
          {props.nearbyError && <small className="athar-v2-location-error" role="alert">{props.nearbyError}</small>}
          <button type="button" onClick={props.onNearbySearch} disabled={props.nearbySearching}>
            {props.nearbySearching ? <span className="assistant-spinner" /> : <Navigation size={14} />}
            {props.nearbySearching ? "جارٍ تحديد الموقع..." : "تفعيل الموقع"}
          </button>
        </aside>
      </div>

      <div className="athar-v2-motion-row">
        <span><MapPin size={13} /> خريطة إرشادية لمدن العراق</span>
        {props.motionStatus !== "unsupported" && (
          <button
            type="button"
            className={props.motionStatus === "enabled" ? "enabled" : ""}
            onClick={() => props.motionStatus === "enabled" ? props.onDisableMotion() : props.onEnableMotion()}
            aria-pressed={props.motionStatus === "enabled"}
          >
            <Smartphone size={13} />
            {props.motionStatus === "enabled" ? "إيقاف حركة الجهاز" : "تفعيل حركة الجهاز"}
          </button>
        )}
      </div>

      <div className="athar-v2-report-actions">
        <button type="button" className="lost-action" onClick={() => props.onOpenReportForm("lost")}>
          <Search size={16} /> فقدت مستنداً
        </button>
        <button type="button" className="found-action" onClick={() => props.onOpenReportForm("found")}>
          <FileText size={16} /> عثرت على مستند
        </button>
      </div>
    </section>
  );
}