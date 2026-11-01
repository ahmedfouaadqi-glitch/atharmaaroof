import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpLeft, HeartHandshake, MapPin, Search, ShieldCheck, Sparkles, Users
} from "lucide-react";
import InfoPageShell from "@/components/InfoPageShell";

export const metadata: Metadata = {
  title: "عن أثر معروف",
  description: "تعرف على خدمة أثر معروف للبحث عن المفقودات والمعثورات في العراق."
};

const principles = [
  {
    Icon: HeartHandshake,
    title: "خدمة مجتمعية",
    text: "تنظيم البلاغات وتسهيل البحث عن المستندات المفقودة والمعثورة."
  },
  {
    Icon: ShieldCheck,
    title: "الخصوصية أولاً",
    text: "تقليل البيانات المنشورة، واحترام موافقة المستخدم على مشاركة موقعه."
  },
  {
    Icon: Search,
    title: "وصول أسهل",
    text: "إتاحة البحث في البلاغات المنشورة بحسب نوع المستند والمدينة."
  },
  {
    Icon: Users,
    title: "استخدام مسؤول",
    text: "تجنّب نشر البيانات الحساسة والتحقق من صاحب المستند قبل تسليمه."
  }
];

const steps = [
  ["01", "أنشئ بلاغاً", "حدّد نوع المستند والمدينة، وأضف وصفاً عاماً لا يتضمن أرقاماً أو صوراً."],
  ["02", "تتم المراجعة", "تخضع البلاغات للمراجعة قبل إتاحتها في نتائج البحث العام."],
  ["03", "تابع بأمان", "راجع المعلومات العامة، وتحقق من الملكية عبر وسيلة آمنة قبل التسليم."]
];

export default function AboutPage() {
  return (
    <InfoPageShell
      kicker="عن أثر معروف"
      title="أثر معروف — كل ما ضاع، له أثر"
      description="منصة عراقية لتنظيم بلاغات المستندات المفقودة والمعثورة وتسهيل البحث في المعلومات المنشورة."
    >
      <section className="about-intro-card">
        <span className="about-intro-icon"><MapPin size={27} /></span>
        <div>
          <span className="section-kicker">رسالتنا</span>
          <h2>تسهيل الوصول إلى المستندات المفقودة</h2>
          <p>تجمع «أثر معروف» البلاغات المنشورة في مكان واحد، وتتيح البحث عنها وإنشاء بلاغ جديد مع تقليل البيانات الشخصية الظاهرة.</p>
        </div>
      </section>

      <section className="info-section-block">
        <div className="info-section-title">
          <span>قيم الخدمة</span>
          <small>ما يوجّه طريقة عمل الخدمة</small>
        </div>
        <div className="info-card-grid">
          {principles.map(({ Icon, title, text }) => (
            <article className="info-feature-card" key={title}>
              <span className="info-feature-icon"><Icon size={23} /></span>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="info-section-block">
        <div className="info-section-title">
          <span>كيف تعمل الخدمة؟</span>
          <small>ثلاث خطوات واضحة</small>
        </div>
        <div className="about-steps-grid">
          {steps.map(([number, title, text]) => (
            <article className="about-step-card" key={number}>
              <span>{number}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-boundary-card">
        <Sparkles size={20} />
        <div>
          <h2>دور المنصة وحدوده</h2>
          <p>أثر معروف منصة مستقلة وليست جهة حكومية أو جهة إصدار للمستندات. تساعد في تنظيم البلاغات والبحث، ولا تُعد نتيجة المطابقة إثباتاً للملكية أو ضماناً لاستعادة المفقود. يجب التحقق من هوية صاحبه قبل التسليم.</p>
        </div>
      </section>

      <Link className="about-cta" href="/"><span>ابدأ باستخدام أثر معروف</span><ArrowUpLeft size={17} /></Link>
    </InfoPageShell>
  );
}
