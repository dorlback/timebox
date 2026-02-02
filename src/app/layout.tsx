import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TimeBox Planner - 효율적인 시간 관리",
  description: "시간을 블록 단위로 관리하고, 하루를 계획하세요. 드래그 앤 드롭으로 쉽게 일정을 조정하고, 목표를 달성하세요.",
  keywords: ["시간 관리", "플래너", "타임박스", "생산성", "일정 관리"],
  authors: [{ name: "dorlback" }],
  openGraph: {
    title: "TimeBox Planner - 효율적인 시간 관리",
    description: "시간을 블록 단위로 관리하고, 하루를 계획하세요.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

