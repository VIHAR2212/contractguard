import type { Metadata } from "next";
import { Inter, JetBrains_Mono, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import FlyingPapersBackground from "@/components/effects/FlyingPapersBackground";
import LivelyCursor from "@/components/effects/LivelyCursor";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});
const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ContractGuard — AI contract review for Indian consumers",
  description:
    "Upload a flat-buyer agreement, personal loan, credit-card T&C, gold-loan document or job offer letter. ContractGuard matches every clause against real Indian law — RERA, RBI, BIS, the Indian Contract Act — and tells you, in plain English or Hindi, what to push back on.",
  keywords: [
    "ContractGuard",
    "RERA",
    "RBI",
    "BIS",
    "Indian Contract Act",
    "contract review India",
    "AI legal review",
  ],
  authors: [{ name: "ContractGuard" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "ContractGuard",
    description: "AI contract review for Indian consumers — RERA, RBI, BIS, ICA.",
    siteName: "ContractGuard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContractGuard",
    description: "AI contract review for Indian consumers.",
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
        className={`${inter.variable} ${jetbrainsMono.variable} ${dmSerifDisplay.variable} antialiased bg-background text-foreground`}
      >
        <FlyingPapersBackground />
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        <LivelyCursor />
        <Toaster />
      </body>
    </html>
  );
}
