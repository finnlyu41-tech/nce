import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "句句有进步 · English Studio",
  description: "原创英语基础课程、听读跟练、词汇复习与雅思衔接训练。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

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
