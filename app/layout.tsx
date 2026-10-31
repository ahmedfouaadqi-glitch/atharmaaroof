import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "أثر معروف | منصة المفقودات والمعثورات",
  description: "أثر معروف منصة عراقية آمنة لتسجيل بلاغات المفقودات والمعثورات والبحث بينها.",
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
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#061719",
  colorScheme: "dark"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
