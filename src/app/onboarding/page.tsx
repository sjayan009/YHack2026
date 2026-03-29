"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorldType } from "../../../types";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MISSIONS } from "@/data/missions";

const WORLDS: { type: WorldType; icon: string; desc: string }[] = [
  { type: "Game Studio", icon: "👾", desc: "Ship features for the next hit indie game." },
  { type: "Space Agency", icon: "🚀", desc: "Write navigation scripts for orbital deployments." },
  { type: "Music Tech Startup", icon: "🎧", desc: "Build algorithms for audio synthesis." },
  { type: "Wildlife Conservation Lab", icon: "🐘", desc: "Process drone data to track endangered species." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [world, setWorld] = useState<WorldType | null>(null);
  const [completedWorlds, setCompletedWorlds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    async function initUser() {
      const sid = localStorage.getItem("forge_session_id");
      if (sid) {
        // Fetch from Supabase Realtime Database
        const { data, error } = await supabase
          .from("forge_users")
          .select("*")
          .eq("id", sid)
          .single();
          
        if (data) {
          setName(data.call_sign);
          setCompletedWorlds(data.completed_worlds || []);
          setStep(2); // Skip name entry if they have a localized active session
        } else {
          localStorage.removeItem("forge_session_id");
        }
      }
      setIsLoading(false);
    }
    initUser();
  }, []);

  const handleLogin = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    
    // Check if Call Sign exists in DB
    const { data: existingUser } = await supabase.from("forge_users").select("*").eq("call_sign", name.trim()).single();
    if (existingUser) {
       localStorage.setItem("forge_session_id", existingUser.id);
       setCompletedWorlds(existingUser.completed_worlds || []);
    } else {
       // Brand new Call Sign, create a fresh profile
       const { data: newUser } = await supabase.from("forge_users").insert([{ call_sign: name.trim() }]).select().single();
       if (newUser) {
          localStorage.setItem("forge_session_id", newUser.id);
          setCompletedWorlds([]);
       }
    }
    setStep(2);
    setIsLoading(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("forge_session_id");
    setName("");
    setWorld(null);
    setCompletedWorlds([]);
    setStep(1);
  };

  const handleNext = async () => {
    if (step === 2 && world) setStep(3);
    else if (step === 3) {
      setIsLoading(true);
      const sid = localStorage.getItem("forge_session_id");
      if (sid) {
        // Ensure their active mission is updated in the cloud
        await supabase
          .from("forge_users")
          .update({ active_world: world })
          .eq("id", sid);
      }
      setIsLoading(false);
      router.push("/workspace");
    }
  };

  if (isLoading && step === 1) {
     return <div className="min-h-screen bg-background flex items-center justify-center text-white/50 text-sm tracking-widest uppercase font-mono animate-pulse">Establishing Secure Uplink...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-2xl px-4 relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center space-y-8"
            >
              <h2 className="text-3xl font-semibold tracking-tight">Initiating protocol... Call sign?</h2>
              <input
                type="text"
                autoFocus
                placeholder="Enter your name"
                className="w-full max-w-sm bg-transparent border-b-2 border-white/20 text-3xl text-center py-2 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/20"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <Button onClick={handleLogin} disabled={isLoading || !name.trim()} className="mt-8 rounded-full px-8">
                {isLoading ? "Authenticating..." : "Confirm Identity"}
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <div className="absolute top-4 right-4 flex z-20">
                 <button onClick={handleSignOut} className="text-[10px] text-white/40 hover:text-white/90 uppercase tracking-widest border border-white/10 hover:border-white/40 rounded px-2 py-1 bg-white/[0.02] backdrop-blur transition-all">
                   Sign Out
                 </button>
              </div>
            
              <h2 className="text-3xl font-semibold mb-2">Welcome, {name}.</h2>
              <p className="text-white/60 mb-8 max-w-md">
                {showBadges ? "Review your successfully completed hackathon missions." : "Select your deployment sector. This determines your first real-world mission."}
              </p>
              
              <div className="flex justify-center mb-6 w-full">
                <div className="bg-white/5 border border-white/10 p-1 rounded-full flex gap-1 items-center">
                  <button onClick={() => setShowBadges(false)} className={`px-4 py-1.5 text-sm rounded-full transition-all ${!showBadges ? 'bg-blue-600 font-medium text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>Missions</button>
                  <button onClick={() => setShowBadges(true)} className={`px-4 py-1.5 text-sm rounded-full transition-all ${showBadges ? 'bg-green-600 font-medium text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>View Badges</button>
                </div>
              </div>
              
              {!showBadges ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {WORLDS.map((w) => {
                    const isCompleted = completedWorlds.includes(w.type);
                    return (
                      <Card 
                        key={w.type}
                        className={`p-6 transition-all duration-300 relative ${isCompleted ? 'opacity-50 cursor-not-allowed pointer-events-none border-white/5' : 'cursor-pointer border border-white/10 hover:border-white/30'} ${world === w.type && !isCompleted ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/[0.02]'}`}
                        onClick={() => !isCompleted && setWorld(w.type)}
                      >
                        {isCompleted && (
                          <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded-full border border-green-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            COMPLETED
                          </div>
                        )}
                        <div className="text-4xl mb-4">{w.icon}</div>
                        <div className="font-semibold text-lg mb-1">{w.type}</div>
                        <div className="text-sm text-white/50">{w.desc}</div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {WORLDS.map((w) => {
                    const isCompleted = completedWorlds.includes(w.type);
                    if (!isCompleted) return null;
                    return (
                      <motion.div
                        key={`badge-${w.type}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 border border-green-500/30 bg-green-500/10 rounded-2xl flex flex-col items-center justify-center relative shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                      >
                         <div className="text-5xl mb-3 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">{w.icon}</div>
                         <div className="font-bold text-green-400 text-lg uppercase tracking-widest">{w.type}</div>
                         <div className="text-green-500/60 text-xs mt-1">Mission Accomplished</div>
                      </motion.div>
                    );
                  })}
                  {completedWorlds.length === 0 && (
                    <div className="col-span-1 md:col-span-2 flex flex-col items-center text-center text-white/40 py-12 border border-white/5 rounded-2xl bg-white/[0.02]">
                       <div className="text-3xl mb-2 opacity-50">🏆</div>
                       No badges earned yet. Complete a mission!
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex gap-4">
                <Button variant="ghost" onClick={() => { setStep(1); setShowBadges(false); }}>Back</Button>
                {!showBadges && (
                  <Button onClick={handleNext} disabled={!world} className="rounded-full px-8 bg-blue-600 hover:bg-blue-500 text-white">
                    Initialize Sector
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-full max-w-lg p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="mb-4 text-left">
                  <div className="text-xs uppercase tracking-widest text-blue-400 mb-1 font-mono">Incoming Transmission</div>
                  <h3 className="text-2xl font-semibold mb-4">Mission Briefing</h3>
                  <div className="h-px w-full bg-white/10 mb-6" />
                  
                  <p className="text-white/80 leading-relaxed font-serif italic mb-6">
                    &quot;Welcome to the team. We&apos;re launching in 48 hours and our lead engineer is out. 
                    We need your help shipping a critical fix for the {world ? MISSIONS[world]?.projectName : 'module'} before we go live. 
                    I&apos;m Atlas, your mentor. I&apos;ll be in the loop if you get stuck, but I trust you can handle this.&quot;
                  </p>                  
                  <div className="bg-white/5 rounded-lg p-4 mb-8">
                    <div className="font-mono text-sm text-white/60 mb-1">Objective</div>
                    <div className="font-medium text-lg leading-snug">{world ? MISSIONS[world]?.bugDescription : ''}</div>
                  </div>
                </div>

                <Button onClick={handleNext} disabled={isLoading} className="w-full py-6 text-lg rounded-xl bg-white text-black hover:bg-white/90 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  {isLoading ? "Saving Credentials to Supabase..." : "Accept Mission & Enter Workspace"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
