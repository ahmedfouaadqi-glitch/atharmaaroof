"use client";

import { useId } from "react";

export function BrandMark({ className = "" }: { className?: string }) {
  const prefix = "athar-mark-" + useId().replace(/:/g, "");
  const gradientId = prefix + "-gradient";

  return (
    <span className={("brand-mark " + className).trim()} aria-hidden="true">
      <svg viewBox="0 0 100 100" fill="none" focusable="false" role="presentation">
        <defs>
          <linearGradient id={gradientId} x1="12" y1="8" x2="88" y2="92" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-primary)" />
            <stop offset=".55" stopColor="var(--color-secondary)" />
            <stop offset="1" stopColor="var(--color-primary)" />
          </linearGradient>
        </defs>
        <path d="M18 67C10 50 16 28 34 17C47 9 62 11 71 18" stroke={`url(#${gradientId})`} strokeWidth="6" strokeLinecap="round" />
        <path d="M24 75C36 63 46 60 59 64C74 69 84 57 86 41L89 22L96 13L93 47C90 72 74 88 54 88C42 88 31 83 24 75Z" stroke={`url(#${gradientId})`} strokeWidth="5" strokeLinejoin="round" />
        <path d="M31 48C31 36 39 28 50 28C61 28 69 36 69 48C69 59 50 73 50 73C50 73 31 59 31 48Z" stroke={`url(#${gradientId})`} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M40 48C40 42 44 38 50 38C56 38 60 42 60 48C60 54 50 62 50 62C50 62 40 54 40 48Z" stroke={`url(#${gradientId})`} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="50" cy="47" r="3.5" fill="var(--color-primary)" />
        <path d="M65 13H84L77 21H62M67 28H80L72 37V50" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
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
