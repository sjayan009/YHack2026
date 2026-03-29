"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MentorState, CognitiveState, MentorMode } from "../../../types";
import { ChevronDown } from "lucide-react";

interface Message {
  role: "mentor" | "user";
  content: string;
}

interface MentorChatProps {
  messages: Message[];
  mentorState: MentorState;
  onSendMessage: (msg: string) => void;
  isTyping?: boolean;
  modeOverride?: MentorMode | null;
  onModeChange?: (mode: MentorMode | null) => void;
}

export function MentorChat({ messages, mentorState, onSendMessage, isTyping, modeOverride, onModeChange }: MentorChatProps) {
  const [inputMsg, setInputMsg] = useState("");
  const [showInsights, setShowInsights] = useState(false);
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getStateColor = (state: CognitiveState) => {
    switch(state) {
      case "productive_flow": return "bg-green-500";
      case "surface_confusion": return "bg-yellow-500";
      case "deep_confusion": return "bg-orange-500";
      case "premature_closure": return "bg-red-500";
      default: return "bg-blue-500";
    }
  };

  const currentActiveMode = modeOverride || mentorState.currentMode;

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-md relative">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg">
            A
          </div>
          <div>
            <div className="font-semibold">Atlas</div>
            <div className="text-xs text-white/50 flex flex-col relative">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${getStateColor(mentorState.inferredCognitiveState)}`}></span>
                
                <button 
                  onClick={() => setIsModeSelectorOpen(!isModeSelectorOpen)}
                  className="flex items-center gap-1 hover:text-white transition-colors focus:outline-none py-1"
                >
                  {currentActiveMode}
                  {modeOverride && <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded ml-1 font-medium tracking-wide">LOCKED</span>}
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </button>
              </div>

              {/* Custom Mode Selector Dropdown */}
              <AnimatePresence>
                {isModeSelectorOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 mt-1 w-40 bg-[#121214] border border-white/10 rounded-lg shadow-xl overflow-hidden z-[100]"
                  >
                    <div 
                      onClick={() => { onModeChange?.(null); setIsModeSelectorOpen(false); }} 
                      className={`px-3 py-2 hover:bg-white/10 cursor-pointer ${modeOverride === null ? 'bg-blue-600/20 text-blue-400' : ''}`}
                    >
                      Auto-Detect
                    </div>
                    <div 
                      onClick={() => { onModeChange?.("Senior Dev"); setIsModeSelectorOpen(false); }} 
                      className={`px-3 py-2 hover:bg-white/10 cursor-pointer ${modeOverride === "Senior Dev" ? 'bg-blue-600/20 text-blue-400' : ''}`}
                    >
                      Senior Dev
                    </div>
                    <div 
                      onClick={() => { onModeChange?.("Rubber Duck"); setIsModeSelectorOpen(false); }} 
                      className={`px-3 py-2 hover:bg-white/10 cursor-pointer ${modeOverride === "Rubber Duck" ? 'bg-blue-600/20 text-blue-400' : ''}`}
                    >
                      Rubber Duck
                    </div>
                    <div 
                      onClick={() => { onModeChange?.("Skeptical User"); setIsModeSelectorOpen(false); }} 
                      className={`px-3 py-2 hover:bg-white/10 cursor-pointer ${modeOverride === "Skeptical User" ? 'bg-blue-600/20 text-blue-400' : ''}`}
                    >
                      Skeptical User
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowInsights(!showInsights)} className="text-xs border border-white/10">
          Insights
        </Button>
      </div>

      {/* Insight Panel */}
      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-blue-900/20 border-b border-white/5 overflow-y-auto max-h-64"
          >
            <div className="p-4 text-xs font-mono text-blue-200/80">
              <div className="font-semibold mb-1 text-white">System Diagnostics:</div>
              <div>Mode Override Status: <span className="text-white">{modeOverride ? "MANUAL" : "AUTO"}</span></div>
              <div>Detected Mode: <span className="text-white">{mentorState.currentMode}</span></div>
              <div>Cognitive State: <span className="text-white">{mentorState.inferredCognitiveState}</span></div>
              
              {/* Added Real-time Backend Signals */}
              {mentorState.insightMetadata && mentorState.insightMetadata.recentSignals && mentorState.insightMetadata.recentSignals.length > 0 && (
                <div className="mt-2 mb-2 p-2 bg-white/5 border border-white/10 rounded">
                  <div className="font-semibold mb-1 text-white/50 uppercase tracking-widest text-[9px]">Last 25 Events (Rolling Window)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {mentorState.insightMetadata.recentSignals.map((signal, idx) => (
                      <span key={idx} className="bg-black/40 px-1.5 py-0.5 rounded border border-white/10 text-[10px]">{signal}</span>
                    ))}
                  </div>
                </div>
              )}

              {mentorState.insightMetadata && (
                <div className="mt-2 text-white/50 italic border-l-2 border-white/20 pl-2">
                  &quot;{mentorState.insightMetadata.reasoning}&quot;
                </div>
              )}
              
              <div className="mt-5 pt-4 border-t border-white/10 text-[10px] leading-relaxed">
                <div className="font-semibold mb-2 text-white/90 uppercase tracking-widest text-[9px]">Persona Auto-Switch Rules</div>
                <div className="space-y-2">
                  <div className="flex gap-2"><span className="text-white font-semibold flex-shrink-0 w-24">Senior Dev:</span> <span>Your default technical assistant. Restores smoothly when you write code without recent errors.</span></div>
                  <div className="flex gap-2"><span className="text-orange-400 font-semibold flex-shrink-0 w-24">Rubber Duck:</span> <span>Activates immediately upon detecting 1+ syntax error, or when you highlight/delete chunks of code. Asks you to explain things instead of giving answers.</span></div>
                  <div className="flex gap-2"><span className="text-red-400 font-semibold flex-shrink-0 w-24">Skeptical User:</span> <span>Activates when you hit 'Run Code' 2x consecutively without any keystrokes. Playfully calls you out for guessing.</span></div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4" 
        ref={scrollRef}
        onClick={() => setIsModeSelectorOpen(false)}
      >
        {messages.length === 0 && (
          <div className="text-center text-white/30 text-sm mt-10">
            Atlas is ready when you need help.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
              m.role === "user" ? "bg-blue-600 text-white" : "bg-white/10 text-white/90 border border-white/5"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex gap-1">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-150"></span>
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-white/5 border-t border-white/10 relative z-10">
        <form 
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            if (inputMsg.trim()) {
              onSendMessage(inputMsg);
              setInputMsg("");
            }
          }}
        >
          <input
            type="text"
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder:text-white/30 transition-colors"
            placeholder={`Ask Atlas...`}
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onClick={() => setIsModeSelectorOpen(false)}
          />
          <button type="submit" className="absolute right-2 top-1.5 bottom-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full px-3 text-xs font-medium transition-colors">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
