"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex flex-col items-center text-center max-w-3xl"
      >
        <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
          Forge Protocol Activated
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Where young coders build things that matter.
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl">
          The coding mentor that gives your code consequences. Learn to code by shipping real missions for startups, space agencies, and game studios.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/onboarding">
            <Button size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-white/90 rounded-full font-medium">
              Start Your First Mission
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full border-white/20 bg-black/50 backdrop-blur-md hover:bg-white/10">
            View Live Demos
          </Button>
        </div>
      </motion.div>

      {/* Feature grid */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        className="z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full"
      >
        {[
          { title: "Motivation", desc: "Adaptive missions that feel real." },
          { title: "Mentorship", desc: "An AI senior dev who pushes you." },
          { title: "Launchpad", desc: "Ship projects and get feedback." }
        ].map((feat, i) => (
          <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <h3 className="font-semibold text-lg text-white mb-2">{feat.title}</h3>
            <p className="text-white/50 text-sm">{feat.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
