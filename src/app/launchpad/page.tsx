"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { MISSIONS, MissionData } from "@/data/missions";

export default function LaunchpadPage() {
  const router = useRouter();
  const [projectData, setProjectData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [mission, setMission] = useState<MissionData | null>(null);

  const [resolvedBugs, setResolvedBugs] = useState<number[]>([]);

  useEffect(() => {
    const savedSrc = localStorage.getItem("forge_project");
    if (savedSrc) {
      setProjectData(JSON.parse(savedSrc));
    }
    
    // Sync completion with Supabase database
    const sid = localStorage.getItem("forge_session_id");
    if (sid) {
      const completeMission = async () => {
         const { data, error } = await supabase.from('forge_users').select('*').eq('id', sid).single();
         if (data && data.active_world) {
            setUserData({ name: data.call_sign, world: data.active_world });
            if (MISSIONS[data.active_world]) {
              setMission(MISSIONS[data.active_world]);
            }
            
            const currentCompleted: string[] = data.completed_worlds || [];
            if (!currentCompleted.includes(data.active_world)) {
                await supabase.from('forge_users').update({
                   completed_worlds: [...currentCompleted, data.active_world]
                }).eq('id', sid);
            }
         }
      };
      completeMission();
    }
  }, []);
  
  const handleResolveBug = (index: number) => {
    if (!resolvedBugs.includes(index)) {
      setResolvedBugs([...resolvedBugs, index]);
    }
  };

  const feedbackData = mission?.launchpadFeedback || [];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-foreground p-8 flex justify-center">
      <div className="w-full max-w-5xl">
        {/* Header Ribbon */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="flex items-center justify-between bg-gradient-to-r from-green-500/20 to-blue-500/10 border border-green-500/20 p-4 rounded-2xl mb-8 backdrop-blur"
        >
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
              DEPLOYMENT SUCCESSFUL
            </h1>
            <p className="text-white/60 text-sm">
              Live at <span className="underline underline-offset-4 text-green-400/80 cursor-pointer">play.pixelforge.dev/score-tracker-fix</span>
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-mono text-white/70">
              v1.0.4-rc
            </div>
            <Button variant="outline" onClick={() => router.push("/workspace")} className="border-white/20 bg-transparent">
              Patch Issues
            </Button>
            <Button onClick={() => router.push("/onboarding")} className="bg-white text-black hover:bg-gray-200">
              Next Mission
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-white/10 overflow-hidden bg-black aspect-video relative"
            >
              {projectData ? (
                <iframe
                  srcDoc={projectData.code}
                  className="w-full h-full bg-white"
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <span className="animate-pulse">Loading Live Build...</span>
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <span className="bg-black/60 rounded px-2 py-1 text-xs font-mono text-white/50 backdrop-blur border border-white/10 shadow-lg">LIVE VIEW</span>
              </div>
            </motion.div>

            {/* Mentor Reflection */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white/5 border-white/10 p-6 backdrop-blur">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xl shadow-lg shrink-0">
                    A
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Atlas&apos;s Reflection</h3>
                    <p className="text-white/70 text-sm leading-relaxed italic mb-4">
                      &quot;Great work hitting your first deployment, {userData?.name || "Dev"}. You stuck with it when the edge cases popped up in {mission?.projectName || 'the module'}. We rely on you to patch critical logic bugs just like this to keep systems highly available. We couldn&apos;t afford for this to break in production. Take a breather, you earned it.&quot;
                    </p>                    <div className="flex gap-2">
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded border border-green-500/20 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Code Review Passed
                      </span>
                      <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/20 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Resilient Logic
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar / Feedback */}
          <div className="space-y-6">
            <motion.h3 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.4 }}
              className="font-semibold text-lg mb-4 flex items-center gap-2"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Live User Feedback
            </motion.h3>

            <div className="space-y-4">
              {feedbackData.map((fb, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors cursor-default">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                          {fb.author.charAt(0)}
                        </div>
                        {fb.author}
                      </div>
                      <span className="text-white/40 text-xs font-mono">{fb.time}</span>
                    </div>
                    <p className="text-white/70 text-sm mb-3">&quot;{fb.text}&quot;</p>                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-0.5 rounded border capitalize ${
                        fb.type === 'bug' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        fb.type === 'praise' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {fb.type}
                      </span>
                      {fb.type === 'bug' && (
                        <button 
                          onClick={() => handleResolveBug(i)}
                          className={`text-xs transition-colors ${resolvedBugs.includes(i) ? 'text-green-400 font-semibold cursor-default' : 'text-white/50 hover:text-white underline underline-offset-2'}`}
                        >
                          {resolvedBugs.includes(i) ? "Fixed ✓" : "Create Ticket"}
                        </button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 pt-8 border-t border-white/10 text-center"
            >
              <div className="text-4xl mb-4">🏆</div>
              <h4 className="font-medium mb-1">First Mission Complete!</h4>
              <p className="text-sm text-white/50">You&apos;ve unlocked the &quot;Bug Squasher&quot; badge.</p>            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
