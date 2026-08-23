"use client";

import { useState } from "react";
import { X, Send, Bot, Sparkles } from "lucide-react";
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
      text: "Hello! I am your TRACE-X Forensic Copilot. I can analyze suspicious headers, decode obfuscated links, and query threat intelligence on demand.",
      sources: ["Telemetry Database"]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const SUGGESTIONS = [
    "What makes this email suspicious?",
    "Show infrastructure related to this attack",
    "Which campaign cluster does this belong to?",
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
          text: `Unable to complete query: ${err.message || "Connection error"}.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-3 rounded-2xl font-bold text-xs shadow-xl shadow-indigo-200 transition-all hover:scale-105 cursor-pointer active:scale-95"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span>AI Forensic Copilot</span>
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
        </button>
      )}

      {/* Floating Chat Box */}
      {isOpen && (
        <div className="w-96 sm:w-[420px] h-[540px] bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F172A]">TRACE-X Copilot</div>
                <div className="text-[11px] text-[#64748B]">Evidence-Grounded Forensic AI</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-[#F8FAFC]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-sm ${
                    m.sender === "user"
                      ? "bg-[#4F46E5] text-white font-medium"
                      : "bg-white border border-[#E2E8F0] text-[#0F172A]"
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-[#E2E8F0] text-[10px] text-[#64748B]">
                      Sources: {m.sources.join(" • ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-xs text-[#4F46E5] flex items-center gap-2 p-2 bg-white rounded-xl border border-[#E2E8F0] w-fit shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse"></span>
                <span>Evaluating forensics...</span>
              </div>
            )}
          </div>

          {/* Prompt Suggestions */}
          <div className="px-4 py-2 bg-white border-t border-[#E2E8F0] overflow-x-auto flex gap-1.5 no-scrollbar">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                disabled={isLoading}
                className="whitespace-nowrap text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#F1F5F9] hover:bg-[#EEF2FF] text-[#475569] hover:text-[#4F46E5] transition-colors flex-shrink-0 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3.5 bg-white border-t border-[#E2E8F0] flex gap-2">
            <input
              type="text"
              placeholder="Ask about this case's evidence..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-40 text-white px-3.5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
