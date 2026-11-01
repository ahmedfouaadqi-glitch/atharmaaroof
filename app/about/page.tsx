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
    title: "خدمة المجتمع",
    text: "تسهيل إعادة المستندات والأغراض المفقودة إلى أصحابها عبر بلاغات واضحة."
  },
  {
    Icon: ShieldCheck,
    title: "الخصوصية أولاً",
    text: "تقليل البيانات المنشورة، واحترام موافقة المستخدم على مشاركة موقعه."
  },
  {
    Icon: Search,
    title: "بحث منظم",
    text: "جمع البلاغات في مكان واحد وتسهيل الوصول إلى النتائج ذات الصلة."
  },
  {
    Icon: Users,
    title: "مسؤولية مشتركة",
    text: "مشاركة واعية تحمي بيانات الأشخاص وتدعم التحقق قبل تسليم المستند."
  }
];

const steps = [
  ["01", "أنشئ بلاغاً", "اختر نوع البلاغ والمدينة وأضف وصفاً عاماً دون أرقام المستندات أو صورها."],
  ["02", "تتم المراجعة", "تُراجع البلاغات قبل ظهورها في البحث العام للحد من المعلومات الحساسة والمضللة."],
  ["03", "تابع بأمان", "استخدم معلومات البلاغ العامة للتحقق والتواصل بطريقة آمنة."]
];

export default function AboutPage() {
  return (
    <InfoPageShell
      kicker="عن أثر معروف"
      title="أثر معروف — لأن كل شيء له أثر"
      description="خدمة مجتمعية عراقية تساعد على تنظيم بلاغات المفقودات والمعثورات وتقريبها إلى أصحابها."
    >
      <section className="about-intro-card">
        <span className="about-intro-icon"><MapPin size={27} /></span>
        <div>
          <span className="section-kicker">رسالتنا</span>
          <h2>أن يصل كل مستند مفقود إلى صاحبه</h2>
          <p>توفّر «أثر معروف» مساحة موحدة للبحث والإبلاغ، وتساعد المستخدم على الوصول إلى البلاغات ذات الصلة دون كشف بياناته الحساسة.</p>
        </div>
      </section>

      <section className="info-section-block">
        <div className="info-section-title">
          <span>مبادئ الخدمة</span>
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
          <p>أثر معروف خدمة مستقلة وليست جهة حكومية أو جهة إصدار للمستندات. تساعد المنصة في تنظيم البلاغات والبحث، لكنها لا تثبت الملكية ولا تضمن استعادة كل مفقود. يجب التحقق من هوية صاحب المستند قبل تسليمه.</p>
        </div>
      </section>

      <Link className="about-cta" href="/"><span>ابدأ باستخدام أثر معروف</span><ArrowUpLeft size={17} /></Link>
    </InfoPageShell>
  );
}
