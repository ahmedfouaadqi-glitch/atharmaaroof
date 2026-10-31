import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "أثَر | استرجع ما يهمك", description: "منصة عراقية آمنة للمفقودات والمعثورات." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ar" dir="rtl"><body>{children}</body></html>; }
