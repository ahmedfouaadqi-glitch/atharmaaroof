import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand";
import ThemeToggle from "@/components/ThemeToggle";
import type { ReactNode } from "react";

export default function InfoPageShell({
  kicker,
  title,
  description,
  children
}: {
  kicker: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="info-page" dir="rtl">
      <header className="info-topbar">
        <Link href="/" className="brand-lockup" aria-label="أثر معروف — الصفحة الرئيسية">
          <BrandMark />
          <span className="brand-copy">
            <strong>أثر <b>معروف</b></strong>
            <small>لأن كل شيء له أثر</small>
          </span>
        </Link>
        <div className="info-header-actions">
          <ThemeToggle compact />
          <Link href="/" className="info-back"><ArrowRight size={15} /> الرئيسية</Link>
        </div>
      </header>

      <div className="info-container">
        <div className="info-heading">
          <span className="section-kicker"><ShieldCheck size={14} /> {kicker}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <article className="info-document">{children}</article>

        <footer className="info-footer">
          <BrandMark />
          <span>© {new Date().getFullYear()} أثر معروف</span>
          <nav aria-label="روابط الصفحات">
            <Link href="/privacy">الخصوصية</Link>
            <Link href="/terms">الاستخدام</Link>
            <Link href="/faq">الأسئلة الشائعة</Link>
            <Link href="/about">عن المبادرة</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
