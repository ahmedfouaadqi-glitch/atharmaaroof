import { useId } from "react";

export function BrandMark({ className = "" }: { className?: string }) {
  const prefix = "athar-" + useId().replace(/:/g, "");
  return (
    <span className={("brand-mark " + className).trim()} aria-hidden="true">
      <svg viewBox="0 0 220 210" fill="none" focusable="false">
        <defs>
          <linearGradient id={`${prefix}-sweep`} x1="20" y1="20" x2="172" y2="185" gradientUnits="userSpaceOnUse">
            <stop stopColor="#45E9DC" />
            <stop offset=".52" stopColor="#18C9CB" />
            <stop offset="1" stopColor="#28BCEB" />
          </linearGradient>
          <linearGradient id={`${prefix}-right`} x1="153" y1="12" x2="199" y2="170" gradientUnits="userSpaceOnUse">
            <stop stopColor="#54D7FA" />
            <stop offset="1" stopColor="#079DC9" />
          </linearGradient>
          <linearGradient id={`${prefix}-white`} x1="129" y1="18" x2="183" y2="145" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset=".56" stopColor="#DFFBFA" />
            <stop offset="1" stopColor="#3ED6D0" />
          </linearGradient>
          <radialGradient id={`${prefix}-drop`} cx="0" cy="0" r="1" gradientTransform="matrix(0 38 -30 0 106 35)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A8FFF4" />
            <stop offset=".5" stopColor="#39E5D9" />
            <stop offset="1" stopColor="#08B9C4" />
          </radialGradient>
          <filter id={`${prefix}-shadow`} x="0" y="0" width="220" height="210" filterUnits="userSpaceOnUse">
            <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
            <feOffset dy="5" />
            <feComponentTransfer><feFuncA type="linear" slope=".24" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g filter="url(#${prefix}-shadow)">
          <path
            d="M76 18C45 25 22 51 15 85C8 119 17 151 35 177L57 158C45 139 40 118 43 95C46 72 58 52 81 42L76 18Z"
            fill="url(#${prefix}-sweep)"
          />
          <path
            d="M34 174C58 151 80 157 104 155C143 153 159 126 163 88L167 39L191 39L187 97C184 143 162 176 125 190C92 203 58 193 31 193L9 193L34 174Z"
            fill="url(#athar-mark-sweep)"
          />
          <path
            d="M145 178C173 157 190 123 192 80L194 48L215 27C216 87 206 141 178 176L145 178Z"
            fill="url(#${prefix}-right)"
          />

          <path d="M135 15H193L181 29H127L135 15Z" fill="url(#${prefix}-white)" />
          <path d="M131 36H184V51L158 77V118H135V47H131V36Z" fill="url(#athar-mark-white)" />
          <path d="M138 44H178L151 69V47H138V44Z" fill="#071F2B" fillOpacity=".82" />
          <path d="M143 45L158 60L171 45M143 58L156 71L169 57M148 72L160 84" stroke="#42D8E5" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M188 28C191 18 199 13 207 13V51C201 58 195 63 190 73V117" stroke="#43CAE9" strokeWidth="4" strokeLinecap="round" />
          <path d="M190 91C201 80 208 72 211 61M190 124C202 115 210 105 213 92" stroke="#64D8F0" strokeWidth="3" strokeLinecap="round" />

          <path d="M105 13C91 26 87 36 91 48C95 61 106 68 118 63C130 57 134 45 127 33C122 24 114 17 105 13Z" fill="url(#${prefix}-drop)" />
          <path d="M62 111C67 91 84 81 102 81C120 81 136 92 142 109" stroke="#22D6CC" strokeWidth="5" strokeLinecap="round" />
          <path d="M55 124C59 102 79 91 101 91C123 91 140 103 147 124" stroke="#25D8CE" strokeWidth="5" strokeLinecap="round" />
          <path d="M58 139C74 132 73 111 85 105C96 98 110 101 116 112C123 124 118 139 112 151" stroke="#28DCCE" strokeWidth="5" strokeLinecap="round" />
          <path d="M73 151C88 144 86 124 96 117C104 111 114 116 115 126C117 138 108 151 99 159" stroke="#2ADFD0" strokeWidth="5" strokeLinecap="round" />
          <path d="M88 162C105 155 114 143 113 131C112 122 105 120 100 126C95 132 98 145 90 151" stroke="#30E1D2" strokeWidth="5" strokeLinecap="round" />
          <path d="M101 166C118 156 128 141 126 124" stroke="#25D2C9" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M133 117C139 123 139 130 138 137" stroke="#32DDCF" strokeWidth="4" strokeLinecap="round" />
          <path d="M110 164L109 171" stroke="#7DFFF0" strokeWidth="4.5" strokeLinecap="round" />
        </g>
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
