"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { WorkspaceEditor } from "@/components/workspace/editor";
import { WorkspacePreview } from "@/components/workspace/preview";
import { MentorChat } from "@/components/mentor/chat";
import { Button } from "@/components/ui/button";
import { BehaviorEvent, MentorState, CognitiveState, MentorMode } from "../../../types";
import { processMentorAction } from "@/lib/mentor/orchestrator";
import { CheckCircle2, Circle } from "lucide-react";

const STARTER_CODE = `<!-- Project: Space Defender Arcade -->
<div id="game">
  <h2>Score: <span id="score">0</span></h2>
  <button id="addScoreBtn">Collect Star Coin (+10)</button>
  <button id="alienDmgBtn">Take Alien Damage (-50)</button>
  <button id="resetScoreBtn">Reset</button>
</div>

<script>
  let score = 0;
  
  function updateDisplay() {
    document.getElementById("score").innerText = score;
  }

  document.getElementById("addScoreBtn").onclick = function() {
    score += 10;
    updateDisplay();
  };

  document.getElementById("alienDmgBtn").onclick = function() {
    // BUG: This just blindly subtracts 50, even if the score is already 0!
    // TODO: Prevent the score from dropping into negative numbers.
    // Hint: Try using an if-statement, or Math.max() 
    score -= 50; 
    updateDisplay();
  };
  
  document.getElementById("resetScoreBtn").onclick = function() {
    score = 0;
    updateDisplay();
  };
</script>
`;

export default function WorkspacePage() {
  const router = useRouter();
  const [code, setCode] = useState(STARTER_CODE);
  const [runTrigger, setRunTrigger] = useState(0);
  const [events, setEvents] = useState<BehaviorEvent[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [modeOverride, setModeOverride] = useState<MentorMode | null>(null);
  const [completedReqs, setCompletedReqs] = useState<boolean[]>([false, false, false]);

  const [messages, setMessages] = useState<{ role: "mentor" | "user", content: string }[]>([
    { role: "mentor", content: "Welcome to PixelForge! I'm Atlas. The math engine in Space Defender is breaking when players take Alien Damage. Hit 'Run Code' and try taking damage to see the exploit in action!" }
  ]);

  const [mentorState, setMentorState] = useState<MentorState>({
    currentMode: "Senior Dev",
    inferredCognitiveState: "productive_flow",
    isVisible: true,
    insightMetadata: { recentSignals: [], reasoning: "Initial assessment." }
  });

  const validateCode = (currentCode: string) => {
    // Req 1: Star Coin Score increases by 10
    const req1 = currentCode.includes("score += 10") || currentCode.includes("score = score + 10");

    // Req 2: Alien Damage button decreases score by 50
    const req2 = currentCode.includes("score -= 50") || currentCode.includes("score = score - 50");

    // Req 3: Clamp zero exploit
    // Fix: We enforce valid clamping syntax to prevent a loose 'score = 0' from tricking the checkmark.
    const stripped = currentCode.replace(/\s+/g, "");
    const req3 = stripped.includes("Math.max(0") || stripped.includes("score=Math.max") || stripped.includes("if(score<0){score=0") || stripped.includes("if(score<0)score=0") || stripped.includes("if(score<=0)score=0");
    
    setCompletedReqs([req1, req2, req3]);
  };

  const handleEvent = async (event: BehaviorEvent) => {
    const newEvents = [...events, event];
    setEvents(newEvents);

    // Evaluate mentor action periodically or on specific triggers
    if (newEvents.length % 5 === 0 || event.type === 'error' || event.type === 'delete_burst' || event.type === 'run') {
      const result = await processMentorAction(newEvents, code, {}, undefined, modeOverride || undefined);
      setMentorState(result.state);

      if (result.response) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { role: "mentor", content: result.response! }]);
        }, 1500);
      }
    }
  };

  const handleError = (msg: string) => {
    handleEvent({ type: "error", timestamp: Date.now(), message: msg });
  };

  const handleRun = () => {
    handleEvent({ type: "run", timestamp: Date.now() });
    setRunTrigger(prev => prev + 1);
    validateCode(code);
  };

  const handleSendMessage = async (msg: string) => {
    const newMessage = { role: "user" as const, content: msg };
    setMessages(prev => [...prev, newMessage]);

    // Trigger explicit mentor response based on user input
    const result = await processMentorAction(events, code, {}, msg, modeOverride || undefined);
    setMentorState(result.state);

    if (result.response) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { role: "mentor", content: result.response! }]);
      }, 1000);
    }
  };

  const handleLaunch = () => {
    if (code.trim() === STARTER_CODE.trim()) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { role: "mentor", content: "Hold on! You haven't patched the Alien Damage exploit yet. Try clamping the score to 0 before we push this to the main branch." }]);
      }, 500);
      return;
    }

    if (runTrigger === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { role: "mentor", content: "Best practice is to hit 'Run Code' to test your changes before we merge to production!" }]);
      }, 500);
      return;
    }

    if (!completedReqs.every(Boolean)) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { role: "mentor", content: "The requirement tests are still failing! Make sure all three checks are green before merging!" }]);
      }, 500);
      return;
    }

    // Save to local storage for Launchpad demo
    localStorage.setItem("forge_project", JSON.stringify({ code }));
    router.push("/launchpad");
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0B] text-foreground font-sans">
      {/* Top Nav */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-black/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="flex h-6 w-6 rounded-full border border-white/20 bg-white/5 items-center justify-center text-xs font-bold font-mono">F</div>
          <div className="text-sm font-semibold opacity-80">PixelForge Studios • <span className="text-white/50 font-normal">Space Defender Score Exploit</span></div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRun} className="bg-green-600 hover:bg-green-500 border-none text-white shadow-[0_0_15px_rgba(22,163,74,0.3)]">
            ▶ Run Code
          </Button>
          <Button size="sm" onClick={handleLaunch} className="bg-white text-black hover:bg-gray-200">
            🚀 Merge to Main
          </Button>
        </div>
      </div>

      {/* Main Workspace layout */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2">

        {/* Left Column: Brief */}
        <div className="w-1/4 min-w-[250px] flex flex-col gap-2 relative">
          <div className="flex-1 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-4 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-white">Mission Objective</h2>
            <div className="text-sm text-white/70 mb-6 bg-white/5 p-3 rounded-lg border border-white/5">
              <strong className="text-white">Security Exploit Patched Needed:</strong> Players discovered a bug in <span className="text-blue-400 font-mono">Space Defender Arcade</span>!
              If they spam the &apos;Alien Damage&apos; button, the underlying mathematical score drops below zero, breaking the high-score boards.
              <br /><br />
              Your job is to refactor the scoring logic so the score hits rock-bottom exactly at 0.
            </div>

            <div className="font-semibold text-sm mb-2 text-white/50 uppercase tracking-widest">Requirements</div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 transition-all">
                {completedReqs[0] ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> : <Circle className="w-5 h-5 text-white/20 shrink-0" />}
                <span className={completedReqs[0] ? "text-green-500" : "text-white/80"}>Star Coins increase score (+10)</span>
              </li>
              <li className="flex items-start gap-2 transition-all">
                {completedReqs[1] ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> : <Circle className="w-5 h-5 text-white/20 shrink-0" />}
                <span className={completedReqs[1] ? "text-green-500" : "text-white/80"}>Alien damage hurts score (-50)</span>
              </li>
              <li className="flex items-start gap-2 transition-all">
                {completedReqs[2] ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> : <Circle className="w-5 h-5 text-white/20 shrink-0" />}
                <span className={completedReqs[2] ? "text-green-500" : "text-white/80"}>Score stops strictly at ≥ 0</span>
              </li>
            </ul>

            {/* Success Banner */}
            {completedReqs.every(Boolean) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium leading-relaxed shadow-[0_0_15px_rgba(34,197,94,0.1)]"
              >
                🎉 Now that you finished the requirements, click on the button <strong>Merge to Main</strong>! 
                <div className="text-green-500/70 text-xs mt-1 italic">You might have to click it twice!!</div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Center Dropdown: Editor & Preview */}
        <div className="flex-1 flex flex-col gap-2 min-w-[400px]">
          <div className="h-1/2 rounded-xl relative">
            <WorkspaceEditor initialCode={code} onChange={setCode} onEvent={handleEvent} />
          </div>
          <div className="h-1/2 rounded-xl relative">
            <WorkspacePreview code={code} runTrigger={runTrigger} onError={handleError} />
          </div>
        </div>

        {/* Right Column: Mentor */}
        <div className="w-1/4 min-w-[300px] h-full">
          <MentorChat
            messages={messages}
            mentorState={mentorState}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            modeOverride={modeOverride}
            onModeChange={setModeOverride}
          />
        </div>
      </div>
    </div>
  );
}
