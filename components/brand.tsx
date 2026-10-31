import type { SVGProps } from "react";

export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="athar-mark-bg" x1="8" y1="4" x2="58" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#145D59" />
          <stop offset="1" stopColor="#082D32" />
        </linearGradient>
        <linearGradient id="athar-mark-accent" x1="34" y1="30" x2="56" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#75F1D9" />
          <stop offset="1" stopColor="#23B99F" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="19" fill="url(#athar-mark-bg)" />
      <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="18.25" stroke="#8CE8D5" strokeOpacity=".24" strokeWidth="1.5" />
      <path d="M17 12.5h18.8L44 20.7v17.1" stroke="#D9FFF6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M35.5 13v8.1a1.6 1.6 0 0 0 1.6 1.6h6.2" stroke="#D9FFF6" strokeOpacity=".82" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 12.5v28.8a4 4 0 0 0 4 4h9" stroke="#D9FFF6" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 28h13M22 35h9" stroke="#78DCC8" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="43.5" cy="44" r="13.5" fill="url(#athar-mark-accent)" stroke="#082D32" strokeWidth="2" />
      <path d="m37.8 44.1 3.8 3.8 7.7-8.2" stroke="#063638" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BrandWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={className} dir="rtl" aria-label="أثر معروف">
      <strong>أثر <b>معروف</b></strong>
    </span>
  );
}
