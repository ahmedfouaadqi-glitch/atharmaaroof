import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "أثر معروف | كل ما ضاع، له أثر",
  description: "أثر معروف منصة عراقية آمنة للمفقودات والمعثورات. ابحث عن المستندات المفقودة، أبلغ عن معثور، واكتشف البلاغات القريبة بموافقتك.",
  applicationName: "أثر معروف",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "أثر معروف",
    statusBarStyle: "black-translucent"
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }]
  },
  openGraph: {
    title: "أثر معروف — ATHAR MAAROOF",
    description: "لأن كل شيء له أثر... ونوصله لأصحابه",
    type: "website",
    locale: "ar_IQ"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#06191e",
  colorScheme: "dark"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
