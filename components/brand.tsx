import { useId } from "react";

export function BrandMark({ className = "" }: { className?: string }) {
  const prefix = "athar-" + useId().replace(/:/g, "");
  return (
    <span className={("brand-mark " + className).trim()} aria-hidden="true">
      <svg viewBox="0 0 100 100" fill="none" focusable="false" role="presentation">
        <defs>
          <linearGradient id={`${prefix}-main`} x1="12" y1="12" x2="84" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#64F5E5" />
            <stop offset=".52" stopColor="#18CFC7" />
            <stop offset="1" stopColor="#39AEEA" />
          </linearGradient>
          <linearGradient id={`${prefix}-shine`} x1="56" y1="14" x2="83" y2="76" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F4FFFF" />
            <stop offset="1" stopColor="#64DDF2" />
          </linearGradient>
        </defs>
        <path d="M50 6C26 6 8 24 8 47C8 69 25 87 47 91" stroke={`url(#${prefix}-main)`} strokeWidth="5" strokeLinecap="round"/>
        <path d="M20 73C30 64 40 63 51 66C66 70 79 60 82 44L87 19L96 10L92 47C89 71 73 87 51 89" stroke={`url(#${prefix}-main)`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M51 19C40 19 31 28 31 39C31 52 51 70 51 70C51 70 71 52 71 39C71 28 62 19 51 19Z" fill={`url(#${prefix}-main)`} fillOpacity=".2" stroke={`url(#${prefix}-shine)`} strokeWidth="3"/>
        <circle cx="51" cy="39" r="7" fill={`url(#${prefix}-shine)`}/>
        <path d="M18 57C25 48 34 46 43 49M24 66C31 59 38 58 45 60" stroke={`url(#${prefix}-main)`} strokeWidth="3" strokeLinecap="round"/>
        <path d="M63 13H84L77 21H61M65 29H80L70 39V53" stroke={`url(#${prefix}-shine)`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

export function BrandWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={className} dir="rtl" aria-label="أثر معروف">
      <strong>أثر <b>معروف</b></strong>
    </span>
  );
}
