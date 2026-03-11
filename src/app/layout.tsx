import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
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
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TimeBox",
  },
  formatDetection: {
    telephone: false,
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="color-scheme" content="light dark" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}

