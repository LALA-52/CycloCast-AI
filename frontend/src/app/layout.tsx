import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CycloCast AI - Cyclone Impact Intelligence System",
  description:
    "Disaster intelligence system for cyclone impact assessment, infrastructure vulnerability scoring, and emergency response coordination.",
  keywords: [
    "cyclone",
    "disaster intelligence",
    "infrastructure vulnerability",
    "risk forecasting",
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
      <body className="min-h-screen bg-[#0a0e17] text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
