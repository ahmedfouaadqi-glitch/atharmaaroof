import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "أثر معروف | كل ما ضاع، له أثر",
  description: "أثر معروف خدمة للبحث عن المفقودات والمعثورات، وإضافة البلاغات ومتابعة النتائج القريبة بموافقتك.",
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
    description: "كل ما ضاع، له أثر — نساعدك على الوصول إلى البلاغات ذات الصلة",
    type: "website",
    locale: "ar_IQ"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#06141f",
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
