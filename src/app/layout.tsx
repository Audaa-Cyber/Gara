import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Gara — Focus, together", template: "%s · Gara" },
  description: "A calm, premium workspace for focused work alone and together.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
