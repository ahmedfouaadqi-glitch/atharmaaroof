import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "أثر معروف | لأن كل شيء له أثر",
  description: "أثر معروف مبادرة عراقية للمفقودات والمعثورات. ابحث عن مستند، أبلغ عن معثور، واكتشف البلاغات القريبة بموافقتك.",
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
  themeColor: "#071b2b",
  colorScheme: "light dark"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" data-theme="dark">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
