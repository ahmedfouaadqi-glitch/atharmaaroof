import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "أثر معروف | سجلّ المفقودات والمعثورات",
  description: "منصة مجتمعية للبحث في بلاغات المستندات المفقودة والمعثورة وإضافة بلاغات جديدة مع احترام الخصوصية.",
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
    title: "أثر معروف — سجل المفقودات والمعثورات",
    description: "ابحث في البلاغات المنشورة أو أضف بلاغاً جديداً بمعلومات عامة وآمنة.",
    type: "website",
    locale: "ar_IQ"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f0e8",
  colorScheme: "light"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" data-theme="light">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
