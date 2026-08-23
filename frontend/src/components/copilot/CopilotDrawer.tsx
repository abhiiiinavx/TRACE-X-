"use client";

import { useState } from "react";
import {
  MessageSquareCode,
  X,
  Send,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  FileCheck2,
  Bot,
  User,
  ChevronUp
} from "lucide-react";
import { queryCopilot } from "@/lib/api";

interface CopilotDrawerProps {
  emailId?: string;
  caseId?: string;
}

export default function CopilotDrawer({ emailId, caseId }: CopilotDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "copilot"; text: string; sources?: string[]; mitre?: string[] }>>([
    {
      sender: "copilot",
      text: "👋 I am your **TRACE-X Forensic Copilot**. I am scoped strictly to the current case's extracted evidence, hop relays, and IOC telemetry. Ask me anything about this attack.",
      sources: ["Case Telemetry Index"]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const SUGGESTIONS = [
    "What makes this email suspicious?",
    "Show all infrastructure related to this attack",
    "Which campaign does this belong to?",
    "What should I investigate next?",
    "Generate executive forensic summary"
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || isLoading) return;

    const userMsg = { sender: "user" as const, text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await queryCopilot({
        question: q,
        email_id: emailId,
        case_id: caseId
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "copilot",
          text: res.answer,
          sources: res.evidence_sources,
          mitre: res.mitre_refs
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "copilot",
          text: `⚠️ **Forensic Service Notice**: Unable to complete query: ${err.message || "Connection error"}.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Trigger Button when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-4 py-3 rounded-full font-bold text-xs shadow-xl shadow-cyan-500/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Bot className="w-5 h-5" />
          <span>AI Forensic Copilot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="w-96 sm:w-[440px] h-[580px] bg-[#0c1222]/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#080d1a] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white flex items-center gap-2">
                  <span>TRACE-X Copilot</span>
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono border border-cyan-500/30">
                    Grounded AI
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">Evidence-Backed Investigation Q&A</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "copilot" && (
                  <div className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-500/30 flex-shrink-0 flex items-center justify-center text-cyan-400">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
                    m.sender === "user"
                      ? "bg-cyan-600 text-slate-950 font-semibold"
                      : "bg-[#111a30] border border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                      <span className="font-semibold text-cyan-400">Telemetry Sources: </span>
                      {m.sources.join(" • ")}
                    </div>
                  )}
                </div>
                {m.sender === "user" && (
                  <div className="w-6 h-6 rounded-md bg-slate-800 flex-shrink-0 flex items-center justify-center text-slate-300">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-cyan-400 font-mono">
                <Bot className="w-4 h-4 animate-spin" />
                <span>Evaluating case telemetry & evidence graph...</span>
              </div>
            )}
          </div>

          {/* Quick Suggested Chips */}
          <div className="px-3 py-2 bg-[#080d1a]/80 border-t border-slate-800/80 overflow-x-auto flex gap-1.5 no-scrollbar">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                disabled={isLoading}
                className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-md bg-[#111a30] hover:bg-cyan-950 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-slate-300 transition-all flex-shrink-0 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#080d1a] border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask copilot about this case's evidence..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-[#111a30] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 px-3 py-2 rounded-lg font-bold transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
