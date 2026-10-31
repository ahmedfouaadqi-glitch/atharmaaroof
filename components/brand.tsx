export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={("brand-mark " + className).trim()} aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none">
        <path d="M9 50.5C18 48 20.5 40 28 35.5C33 32.5 37 28.8 41 24" stroke="#41E4C4" strokeWidth="4.2" strokeLinecap="round" />
        <ellipse cx="13.8" cy="43.8" rx="3.1" ry="5.3" transform="rotate(37 13.8 43.8)" fill="#67EBD0" />
        <ellipse cx="21.4" cy="38.3" rx="2.5" ry="4.2" transform="rotate(38 21.4 38.3)" fill="#42DCC0" />
        <ellipse cx="28.3" cy="32.1" rx="2.1" ry="3.5" transform="rotate(38 28.3 32.1)" fill="#28C6AA" />
        <path d="M43 7.5C34.9 7.5 28.5 13.9 28.5 22c0 10.2 14.5 24.2 14.5 24.2S57.5 32.2 57.5 22C57.5 13.9 51.1 7.5 43 7.5Z" fill="#28BFA4" stroke="#D3FFF5" strokeOpacity=".75" strokeWidth="1.5" />
        <circle cx="43" cy="22" r="7.1" fill="#073A39" />
        <circle cx="43" cy="22" r="3.2" fill="#B5FFF0" />
        <path d="M14 55.5c8.6 1.2 17-2.2 22.1-8.6" stroke="#5FDCC4" strokeOpacity=".56" strokeWidth="1.6" strokeLinecap="round" />
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
