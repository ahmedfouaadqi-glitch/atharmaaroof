import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "دخول إدارة أثر معروف",
  robots: { index: false, follow: false }
};

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return children;
}
