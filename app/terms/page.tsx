import type { Metadata } from "next";
import Link from "next/link";
import { FileCheck2, ShieldAlert, MapPin, BadgeCheck, Scale } from "lucide-react";
import InfoPageShell from "@/components/InfoPageShell";

export const metadata: Metadata = {
  title: "شروط الاستخدام | أثر معروف",
  description: "ضوابط استخدام أثر معروف وحقوق المستخدم ومسؤولياته.",
  robots: { index: true, follow: true }
};

const termsCards = [
  {
    Icon: FileCheck2,
    title: "طبيعة الخدمة",
    summary: "منصة لتنظيم البلاغات والبحث عن المفقودات والمعثورات.",
    points: [
      "تساعد المنصة على نشر البلاغات بعد مراجعتها والبحث في المعلومات العامة المتاحة.",
      "أثر معروف ليست جهة حكومية أو مصرفاً أو جهة إصدار للمستندات.",
      "لا تضمن المنصة العثور على المفقود أو صحة كل معلومة يرسلها مستخدم آخر."
    ]
  },
  {
    Icon: ShieldAlert,
    title: "مسؤولية المستخدم",
    summary: "استخدم المنصة بمعلومات صحيحة واحمِ بياناتك وبيانات الآخرين.",
    points: [
      "قدّم وصفاً دقيقاً ومعقولاً، ولا تنشر بلاغاً كاذباً أو مضللاً أو بقصد الإضرار بالغير.",
      "لا ترفع صور الهوية أو الجواز أو البطاقة المصرفية، ولا تكتب أرقامها أو رموز PIN أو CVV أو OTP.",
      "لا تنشر أرقام الهواتف أو العناوين السكنية أو بيانات الاتصال الخاصة بأي شخص.",
      "لا تستخدم المنصة للمراقبة أو التعقب أو جمع بيانات عن أشخاص دون إذنهم، ولا ترفع محتوى مخالفاً للقانون أو حقوق الغير."
    ]
  },
  {
    Icon: BadgeCheck,
    title: "المراجعة والتسليم",
    summary: "البلاغ لا يصبح عاماً إلا بعد مراجعته ونشره.",
    points: [
      "يجوز رفض البلاغ أو إخفاؤه إذا احتوى معلومات حساسة أو مضللة أو خالف هذه الشروط.",
      "المطابقة النصية أو الجغرافية مؤشر مساعد ولا تثبت ملكية المستند أو هوية صاحبه.",
      "تحقق من صاحب المستند عبر وسيلة آمنة، وسلّمه في مكان عام مناسب، ولا تكشف أرقامه السرية."
    ]
  },
  {
    Icon: MapPin,
    title: "الموقع والميكروفون",
    summary: "الموقع والصوت اختياريان ويعملان بعد اختيارك.",
    points: [
      "لا يُطلب الموقع الدقيق أو الميكروفون تلقائياً؛ يبدأ الإذن بعد إجراء واضح منك.",
      "يمكنك رفض الإذن أو سحبه من إعدادات المتصفح، ويبقى البحث بالمدينة متاحاً.",
      "يعرض المساعد نتائج إرشادية مبنية على البلاغات المنشورة وقد لا يجد نتيجة مطابقة."
    ]
  }
];

const legalSources = [
  ["الدستور العراقي — مجلس النواب", "https://iq.parliament.iq/%D8%A7%D9%84%D8%AF%D8%B3%D8%AA%D9%88%D8%B1-%D8%A7%D9%84%D8%B9%D8%B1%D8%A7%D9%82%D9%8A/"],
  ["قانون التوقيع الإلكتروني والمعاملات الإلكترونية رقم 78 لسنة 2012 — وزارة العدل", "https://www.moj.gov.iq/view.205/"],
  ["قانون حماية المستهلك رقم 1 لسنة 2010 — وزارة العدل", "https://www.moj.gov.iq/upload/pdf/%D9%82%D8%A7%D9%86%D9%88%D9%86%20%D8%AD%D9%85%D8%A7%D9%8A%D8%A9%20%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D9%87%D9%84%D9%83.pdf"],
  ["اللائحة العامة لحماية البيانات GDPR — EUR-Lex", "https://eur-lex.europa.eu/eli/reg/2016/679/"],
  ["توجيه الخصوصية الإلكترونية 2002/58/EC — EUR-Lex", "https://eur-lex.europa.eu/eli/dir/2002/58/oj"],
  ["CCPA / CPRA — California DOJ", "https://www.oag.ca.gov/privacy/ccpa"]
];

export default function TermsPage() {
  return (
    <InfoPageShell
      kicker="حقوق ومسؤوليات"
      title="سياسة الاستخدام"
      description="آخر تحديث: 1 نوفمبر 2026. استخدامك للمنصة يعني التزامك بالضوابط المختصرة التالية."
    >
      <div className="policy-card-grid">
        {termsCards.map(({ Icon, title, summary, points }) => (
          <details className="policy-card" key={title}>
            <summary>
              <span className="policy-card-icon"><Icon size={22} /></span>
              <span className="policy-card-title"><b>{title}</b><small>{summary}</small></span>
              <span className="policy-card-expand" aria-hidden="true">+</span>
            </summary>
            <ul>{points.map((point) => <li key={point}>{point}</li>)}</ul>
          </details>
        ))}
      </div>

      <section className="legal-card">
        <div className="legal-card-heading">
          <span className="policy-card-icon"><Scale size={22} /></span>
          <div>
            <h2>القوانين واللوائح ذات الصلة</h2>
            <p>يُراعى دستور جمهورية العراق لسنة 2005، بما في ذلك المادتان 17 و40، وقانون التوقيع الإلكتروني والمعاملات الإلكترونية رقم 78 لسنة 2012، وقانون حماية المستهلك رقم 1 لسنة 2010، كلٌّ في نطاق تطبيقه. وقد تنطبق تشريعات حماية البيانات في دول أخرى عندما تتوافر شروط انطباقها.</p>
          </div>
        </div>
        <div className="legal-source-links">
          {legalSources.map(([label, url]) => (
            <a href={url} key={url} target="_blank" rel="noopener noreferrer">{label}</a>
          ))}
        </div>
        <p className="legal-disclaimer">هذه الشروط لا تمثل استشارة قانونية. عند وجود تعارض أو نزاع، تُراعى القوانين النافذة والجهات المختصة في جمهورية العراق، وتُراجع الصياغة دورياً مع مستشار قانوني.</p>
      </section>

      <div className="info-next-links">
        <Link href="/privacy">سياسة الخصوصية</Link>
        <Link href="/faq">الأسئلة الشائعة</Link>
      </div>
    </InfoPageShell>
  );
}
