import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { Toaster as AppToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import StudyTracker from "@/components/cognify/StudyTracker";
import LayoutShell from "@/components/LayoutShell";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cognify - Your Personal AI Tutor, Available 24/7",
  description: "Master any subject with personalized learning, gamified engagement, and real-time insights. All at 1/10th cost of traditional tutoring.",
  keywords: ["Cognify", "AI Tutor", "Personalized Learning", "JEE", "NEET", "EdTech", "Online Learning"],
  icons: {
    icon: "/favicon.svg",
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
    <html
      lang="en"
      className={`dark ${inter.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface antialiased">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <StudyTracker />
              <LayoutShell>{children}</LayoutShell>
              <AppToaster />
              <SonnerToaster position="top-right" richColors />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
