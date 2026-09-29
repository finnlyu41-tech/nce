import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./home-screen.css";

export const metadata: Metadata = {
  title: "句句有进步 · English Studio",
  description: "原创英语基础课程、听读跟练、词汇复习与雅思衔接训练。",
  manifest: "/manifest.webmanifest",
  appleWebApp: {capable: true, title: "句句有进步", statusBarStyle: "default"},
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#ffffff"};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
