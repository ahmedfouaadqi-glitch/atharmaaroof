export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={("brand-mark " + className).trim()} aria-hidden="true">
      <svg viewBox="0 0 120 120" fill="none">
        <defs>
          <linearGradient id="athar-symbol-sweep" x1="10" y1="106" x2="106" y2="8" gradientUnits="userSpaceOnUse">
            <stop stopColor="#13B89F" />
            <stop offset=".56" stopColor="#35E4C4" />
            <stop offset="1" stopColor="#A9FFF0" />
          </linearGradient>
          <linearGradient id="athar-symbol-stroke" x1="72" y1="8" x2="98" y2="108" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F8FFFF" />
            <stop offset="1" stopColor="#25C7B0" />
          </linearGradient>
        </defs>
        <path d="M18 99C8 76 13 47 31 28C45 13 65 8 82 10" stroke="url(#athar-symbol-sweep)" strokeWidth="10" strokeLinecap="round" />
        <path d="M21 91C27 63 47 43 72 36" stroke="#27D7BA" strokeWidth="5" strokeLinecap="round" />
        <path d="M62 104L73 24L103 24L87 103" stroke="url(#athar-symbol-stroke)" strokeWidth="9" strokeLinejoin="round" />
        <path d="M72 13H104" stroke="#F5FFFF" strokeWidth="8" strokeLinecap="round" />
        <circle cx="83" cy="28" r="10" fill="#2FDCC0" stroke="#9CFFEB" strokeWidth="2" />
        <path d="M36 79C36 65 46 54 59 54C72 54 81 64 81 77" stroke="#13BDA5" strokeWidth="4" strokeLinecap="round" />
        <path d="M43 83C43 72 50 64 59 64C68 64 74 71 74 81" stroke="#16CDB0" strokeWidth="3.3" strokeLinecap="round" />
        <path d="M51 86C51 79 54 74 59 74C64 74 67 79 67 86" stroke="#35E5C6" strokeWidth="3" strokeLinecap="round" />
        <path d="M59 87V92" stroke="#B6FFF0" strokeWidth="3" strokeLinecap="round" />
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
