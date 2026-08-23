"use client";

import { useState } from "react";
import { MessageSquareCode, X, Send, Bot, User } from "lucide-react";
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
      text: "I am your TRACE-X Forensic Copilot. I am scoped strictly to the current case's extracted evidence, hop relays, and IOC telemetry.",
      sources: ["Telemetry Index"]
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
    <div className="fixed bottom-5 right-5 z-50">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#161D26] hover:bg-[#1F2933] border border-[#1F2933] text-[#E6EBF0] px-3.5 py-2 rounded-md text-xs font-medium shadow-md transition-colors cursor-pointer"
        >
          <Bot className="w-4 h-4 text-[#2DD4BF]" strokeWidth={1.5} />
          <span>AI Copilot</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#34C795]"></span>
        </button>
      )}

      {/* Floating Chat Box */}
      {isOpen && (
        <div className="w-96 sm:w-[420px] h-[520px] soc-card shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-[#0B0F14] border-b border-[#1F2933] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#2DD4BF]" strokeWidth={1.5} />
              <div>
                <div className="text-xs font-semibold text-[#E6EBF0]">TRACE-X Copilot</div>
                <div className="text-[10px] text-[#7C8896]">Evidence-Grounded Investigation Q&A</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#7C8896] hover:text-[#E6EBF0] p-1 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-md p-2.5 leading-relaxed ${
                    m.sender === "user"
                      ? "bg-[#2DD4BF] text-[#0B0F14] font-medium"
                      : "bg-[#0B0F14] border border-[#1F2933] text-[#E6EBF0]"
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-[#1F2933] text-[10px] text-[#7C8896] font-mono">
                      Sources: {m.sources.join(" • ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-xs text-[#7C8896] font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse"></span>
                <span>Evaluating telemetry...</span>
              </div>
            )}
          </div>

          {/* Prompt Chips */}
          <div className="px-3 py-2 bg-[#0B0F14] border-t border-[#1F2933] overflow-x-auto flex gap-1.5 no-scrollbar">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                disabled={isLoading}
                className="whitespace-nowrap text-[10px] px-2 py-1 rounded bg-[#161D26] hover:bg-[#1F2933] text-[#7C8896] hover:text-[#E6EBF0] transition-colors flex-shrink-0 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#0B0F14] border-t border-[#1F2933] flex gap-2">
            <input
              type="text"
              placeholder="Ask about this case's evidence..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-[#10161D] border border-[#1F2933] rounded-md px-3 py-1.5 text-xs text-[#E6EBF0] placeholder-[#7C8896] focus:outline-none focus:border-[#2DD4BF]"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-[#2DD4BF] hover:bg-[#14B8A6] disabled:opacity-40 text-[#0B0F14] px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
