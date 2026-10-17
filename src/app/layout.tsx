import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gara — Make room for focus",
    template: "%s · Gara",
  },
  description:
    "A calmer place to make progress. Organize your work, find your focus, and work alongside people you care about.",
  applicationName: "Gara",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#f7f7f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}