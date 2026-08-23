import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import CopilotDrawer from "@/components/copilot/CopilotDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TRACE-X — AI-Powered Email Threat Detection, Geolocation & Forensic Platform",
  description: "Production-quality cyber-forensics platform with hop relay reconstruction, domain typosquatting detection, campaign DNA clustering, and explainable AI scoring.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex bg-[#060913] text-slate-200 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Left SOC Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Universal Floating AI Forensic Copilot */}
        <CopilotDrawer />
      </body>
    </html>
  );
}
