import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import StudyTracker from "@/components/cognify/StudyTracker";
import LayoutShell from "@/components/LayoutShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cognify - Your Personal AI Tutor, Available 24/7",
  description: "Master any subject with personalized learning, gamified engagement, and real-time insights. All at 1/10th cost of traditional tutoring.",
  keywords: ["Cognify", "AI Tutor", "Personalized Learning", "JEE", "NEET", "EdTech", "Online Learning"],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Cognify - Your Personal AI Tutor",
    description: "Master any subject with personalized learning, gamified engagement, and real-time insights. All at 1/10th cost of traditional tutoring.",
    url: "/",
    siteName: "Cognify",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <StudyTracker />
            <LayoutShell>{children}</LayoutShell>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
