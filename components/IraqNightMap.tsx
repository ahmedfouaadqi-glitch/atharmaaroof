"use client";

export default function IraqNightMap() {
  return (
    <div className="iraq-night-map" role="img" aria-label="خريطة إرشادية لمدن العراق">
      <svg viewBox="0 0 1200 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="iraq-bg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#06191d"/><stop offset=".55" stopColor="#09282b"/><stop offset="1" stopColor="#061418"/></linearGradient>
          <linearGradient id="iraq-land" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#17413d" stopOpacity=".7"/><stop offset="1" stopColor="#0c2429" stopOpacity=".92"/></linearGradient>
          <linearGradient id="iraq-river" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#23a99e" stopOpacity=".15"/><stop offset=".48" stopColor="#67e9d1" stopOpacity=".8"/><stop offset="1" stopColor="#23a99e" stopOpacity=".18"/></linearGradient>
          <radialGradient id="iraq-gold"><stop stopColor="#ffdd8a" stopOpacity=".9"/><stop offset=".3" stopColor="#eeb761" stopOpacity=".28"/><stop offset="1" stopColor="#eeb761" stopOpacity="0"/></radialGradient>
          <radialGradient id="iraq-teal"><stop stopColor="#62f0d3" stopOpacity=".86"/><stop offset=".3" stopColor="#27c7ad" stopOpacity=".25"/><stop offset="1" stopColor="#27c7ad" stopOpacity="0"/></radialGradient>
          <pattern id="iraq-grid" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M42 0H0V42" fill="none" stroke="#6cc6b6" strokeOpacity=".08"/><circle cx="1" cy="1" r="1" fill="#79e6ce" fillOpacity=".2"/></pattern>
          <clipPath id="iraq-clip"><path d="M440 42 492 28 535 43 579 38 616 62 660 67 691 101 742 116 772 151 805 163 815 196 848 224 836 261 848 293 822 322 814 359 779 381 739 377 702 407 664 395 627 417 583 396 551 374 515 372 482 353 454 335 426 302 388 280 396 244 373 213 387 179 368 151 391 123 387 93 417 76Z"/></clipPath>
          <filter id="iraq-blur"><feGaussianBlur stdDeviation="6"/></filter>
        </defs>
        <rect width="1200" height="440" fill="url(#iraq-bg)"/><rect width="1200" height="440" fill="url(#iraq-grid)"/>
        <g fill="none" stroke="#5c9f8f" strokeOpacity=".17">
          <path d="M-30 120C180 5 320 250 520 115S875 5 1230 130"/><path d="M-50 156C145 55 342 286 541 151S885 55 1240 166"/>
          <path d="M-40 202C170 80 358 329 559 193S920 87 1230 212"/><path d="M-50 250C160 132 370 374 584 244S960 130 1240 261"/>
          <path d="M-20 300C183 180 397 420 622 296S950 183 1220 312"/>
        </g>
        <path d="M440 42 492 28 535 43 579 38 616 62 660 67 691 101 742 116 772 151 805 163 815 196 848 224 836 261 848 293 822 322 814 359 779 381 739 377 702 407 664 395 627 417 583 396 551 374 515 372 482 353 454 335 426 302 388 280 396 244 373 213 387 179 368 151 391 123 387 93 417 76Z" fill="url(#iraq-land)" stroke="#49c7ad" strokeOpacity=".42" strokeWidth="2"/>
        <g clipPath="url(#iraq-clip)">
          <rect x="340" width="540" height="440" fill="url(#iraq-grid)"/>
          <g fill="none" stroke="#ddb16d" strokeOpacity=".25" strokeWidth="2">
            <path d="M375 105C458 110 490 145 540 181S635 230 704 280 802 338 870 365"/><path d="M360 164C455 155 488 195 544 215S651 282 711 309 798 360 864 390"/>
            <path d="M401 36C440 108 481 134 528 161S611 203 655 247 730 320 782 425"/><path d="M487 18C505 90 548 127 586 171S640 235 673 300 730 371 760 441"/>
          </g>
          <g fill="none" stroke="#53cdbb" strokeOpacity=".28" strokeWidth="1.4">
            <path d="M392 86C452 95 478 125 515 155S583 202 621 244 674 312 708 383"/><path d="M430 30C465 79 475 116 501 147S554 193 581 234 625 306 644 388"/>
            <path d="M535 25C551 81 579 114 605 152S644 216 665 268 712 341 744 386"/>
          </g>
          <path d="M445 67C500 110 518 153 560 197S625 260 640 308 688 365 730 414" fill="none" stroke="url(#iraq-river)" strokeWidth="6"/>
          <path d="M535 46C544 111 565 155 593 196S628 267 650 315 690 367 727 410" fill="none" stroke="#51c8c0" strokeOpacity=".27" strokeWidth="2"/>
          <path d="M378 220C440 211 482 222 520 250S595 304 637 329 729 374 820 370" fill="none" stroke="#e6ad62" strokeOpacity=".48" strokeWidth="3"/>
          <g fill="#f0bd73" opacity=".58">
            <circle cx="492" cy="118" r="2"/><circle cx="510" cy="137" r="2.5"/><circle cx="528" cy="154" r="2"/><circle cx="552" cy="174" r="3"/>
            <circle cx="566" cy="188" r="2"/><circle cx="588" cy="207" r="2"/><circle cx="612" cy="226" r="2.4"/><circle cx="630" cy="247" r="2"/>
            <circle cx="651" cy="269" r="2.2"/><circle cx="670" cy="294" r="2"/><circle cx="689" cy="318" r="2.2"/><circle cx="709" cy="337" r="2.6"/><circle cx="740" cy="354" r="2"/>
          </g>
          <g fill="#e9b76f" opacity=".2" filter="url(#iraq-blur)"><circle cx="520" cy="155" r="28"/><circle cx="640" cy="267" r="38"/><circle cx="736" cy="356" r="31"/></g>
        </g>
        <g opacity=".8" fill="#efb86f"><circle cx="481" cy="115" r="2"/><circle cx="515" cy="92" r="2"/><circle cx="565" cy="124" r="2"/><circle cx="705" cy="135" r="2"/><circle cx="763" cy="187" r="2"/><circle cx="785" cy="257" r="2"/><circle cx="755" cy="314" r="2"/><circle cx="688" cy="376" r="2"/><circle cx="571" cy="348" r="2"/><circle cx="453" cy="278" r="2"/></g>
        <g className="map-city" transform="translate(500 93)"><circle r="24" fill="url(#iraq-teal)"/><path d="M0-12C-7-12-12-6-12 1c0 8 12 19 12 19S12 9 12 1C12-6 7-12 0-12Z" fill="#27cbb0" stroke="#b0fff0"/><circle cy="1" r="3.5" fill="#063a37"/><text x="-17" y="-22" textAnchor="end">الموصل</text></g>
        <g className="map-city" transform="translate(630 86)"><circle r="20" fill="url(#iraq-teal)"/><path d="M0-10C-6-10-10-5-10 1c0 7 10 16 10 16S10 8 10 1C10-5 6-10 0-10Z" fill="#29cdb3" stroke="#a3f8e5"/><circle cy="1" r="3" fill="#063a37"/><text x="16" y="-12" textAnchor="start">أربيل</text></g>
        <g className="map-city" transform="translate(665 155)"><circle r="19" fill="url(#iraq-teal)"/><path d="M0-9C-5.5-9-9-5-9 1c0 6 9 15 9 15S9 7 9 1C9-5 5.5-9 0-9Z" fill="#28c8ae" stroke="#a4f7e5"/><circle cy="1" r="3" fill="#063a37"/><text x="15" y="-9" textAnchor="start">كركوك</text></g>
        <g className="map-city" transform="translate(640 260)"><circle r="42" fill="url(#iraq-gold)"/><path d="M0-17C-9-17-16-10-16 0c0 12 16 27 16 27S16 12 16 0C16-10 9-17 0-17Z" fill="#efb761" stroke="#fff0c8" strokeWidth="1.6"/><circle cy="0" r="5" fill="#8b512c"/><text x="0" y="46" textAnchor="middle" className="map-city-primary">بغداد</text></g>
        <g className="map-city" transform="translate(577 291)"><circle r="20" fill="url(#iraq-teal)"/><path d="M0-10C-6-10-10-5-10 1c0 7 10 16 10 16S10 8 10 1C10-5 6-10 0-10Z" fill="#29cdb3" stroke="#a3f8e5"/><circle cy="1" r="3" fill="#063a37"/><text x="-14" y="26" textAnchor="end">كربلاء</text></g>
        <g className="map-city" transform="translate(615 337)"><circle r="20" fill="url(#iraq-teal)"/><path d="M0-10C-6-10-10-5-10 1c0 7 10 16 10 16S10 8 10 1C10-5 6-10 0-10Z" fill="#29cdb3" stroke="#a3f8e5"/><circle cy="1" r="3" fill="#063a37"/><text x="-16" y="25" textAnchor="end">النجف</text></g>
        <g className="map-city" transform="translate(975 365)"><circle r="22" fill="url(#iraq-teal)"/><path d="M0-11C-6-11-11-6-11 1c0 8 11 17 11 17S11 9 11 1C11-6 6-11 0-11Z" fill="#29cdb3" stroke="#a3f8e5"/><circle cy="1" r="3" fill="#063a37"/><text x="-16" y="-18" textAnchor="end">البصرة</text></g>
      </svg>
      <div className="iraq-map-label">العراق <span>IRAQ</span></div>
      <div className="iraq-map-caption">مواقع المدن إرشادية · نتائج القرب تعتمد على إذن موقعك</div>
    </div>
  );
}