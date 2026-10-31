import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpLeft, BrainCircuit, BriefcaseBusiness, MapPin, ShieldCheck } from "lucide-react";
import InfoPageShell from "@/components/InfoPageShell";

export const metadata: Metadata = {
  title: "عن أثر معروف | المبادرة وصاحبها",
  description: "الرؤية والملكية والتطوير في منصة أثر معروف."
};

export default function AboutPage() {
  return (
    <InfoPageShell
      kicker="عن المبادرة"
      title="أثر معروف — كل ما ضاع، له أثر"
      description="منصة عراقية تنظم بلاغات المفقودات والمعثورات وتقرّب نتائج البحث من مكان المستخدم بموافقته."
    >
      <section className="founder-card">
        <span className="founder-avatar"><MapPin size={24} /></span>
        <div>
          <span className="section-kicker">صاحب المبادرة والرؤية المنتجية</span>
          <h2>أحمد معروف</h2>
          <p>قيادي في العمليات والإدارة التنفيذية وتطوير الأعمال، بخبرة مهنية تتجاوز 15 عاماً بحسب سيرته الذاتية في مجالات المدفوعات الإلكترونية والمشاريع الحكومية والعمليات الميدانية وإدارة الفرق.</p>
        </div>
      </section>
      <section>
        <h2>من الخبرة التشغيلية إلى منتج يخدم الناس</h2>
        <p>تعكس «أثر معروف» توجهاً يجمع بين فهم العمليات الميدانية، وتنظيم البلاغات، وتحسين تجربة المستخدم، وبناء خدمة رقمية عملية. قيادة المبادرة وتوجيه المنتج وتشغيله وتطويره تعود إلى أحمد معروف.</p>
      </section>
      <div className="about-pillars">
        <article><BriefcaseBusiness size={22} /><b>العمليات والمشاريع</b><p>تخطيط الإجراءات، إدارة الفرق، جودة الخدمة، ومتابعة مؤشرات الأداء.</p></article>
        <article><BrainCircuit size={22} /><b>المنتجات والذكاء الاصطناعي</b><p>تطوير منتجات رقمية وتوظيف الذكاء الاصطناعي وتحسين الظهور في محركات البحث وإجاباتها.</p></article>
        <article><ShieldCheck size={22} /><b>خدمة موثوقة</b><p>الخصوصية أولاً، موقع بإذن المستخدم، وبلاغات تمر بالمراجعة قبل النشر.</p></article>
      </div>
      <section>
        <h2>مشاريع رقمية أخرى وفق السيرة الذاتية</h2>
        <ul>
          <li><b>MAAROOF AI:</b> منصة في مجالات GEO وSEO وAEO لقياس وتحسين الظهور الرقمي.</li>
          <li><b>Mshawir:</b> منصة محلية لطلب نقل الركاب وتقدير الأجرة وتتبع الرحلة.</li>
          <li><b>Urstory / بصمة حكاية:</b> منصة لإنشاء قصص شخصية باستخدام الذكاء الاصطناعي.</li>
        </ul>
      </section>
      <section>
        <h2>الملكية والمسؤولية</h2>
        <p>اسم «أثر معروف» وهويته ورؤيته المنتجية تخص المبادرة التي يقودها أحمد معروف. تخضع إدارة البلاغات والمراجعة والصلاحيات لضوابط تشغيلية منفصلة، ولا تعني الملكية الشخصية إعفاء المنصة من مسؤوليات الخصوصية والأمان والقوانين النافذة.</p>
      </section>
      <Link className="about-cta" href="/"><span>ابدأ باستخدام أثر معروف</span><ArrowUpLeft size={17} /></Link>
    </InfoPageShell>
  );
}
