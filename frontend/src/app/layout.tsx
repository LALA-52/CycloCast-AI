import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CYCLOCAST AI | Cyclone Impact & Infrastructure Vulnerability Forecaster",
  description:
    "Predict. Prioritize. Protect. AI-powered disaster intelligence platform evaluating localized cyclone impact, transparent infrastructure risk scoring (40/30/20/10), and Gemini multimodal emergency action plans.",
  keywords: [
    "cyclone",
    "disaster intelligence",
    "infrastructure vulnerability",
    "risk forecasting",
    "Gemini AI",
    "emergency response",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-rose-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
