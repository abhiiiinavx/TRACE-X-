import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import CopilotDrawer from "@/components/copilot/CopilotDrawer";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "TRACE-X — AI-Powered Email Security & Cyber-Forensics Platform",
  description: "Next-generation email security, hop relay forensics, domain spoofing analysis and AI incident response.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <Navbar />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Floating AI Forensic Copilot */}
        <CopilotDrawer />
      </body>
    </html>
  );
}
