import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بوابة إدارة أثر معروف",
  robots: { index: false, follow: false }
};

export default function ControlCenterLayout({ children }: { children: ReactNode }) {
  return children;
}
