"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaXTwitter, FaGithub, FaDiscord } from "react-icons/fa6";
import { MdOutlineAutoAwesome } from "react-icons/md";
import MessageInput from "@/components/MessageInput";
import { BookOpen } from "lucide-react";
import { authService } from "@/services/auth.service";

const SUGGESTIONS = [
  "Design a SaaS dashboard with auth and billing",
  "Build a mobile-first e-commerce checkout flow",
  "Create a real-time collaboration tool",
  "Build a multi-tenant API with rate limiting",
];

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    authService.getSession().then(session => {
      if (session) setUser(session.user);
    });
  }, []);

  const handleSend = async (msg: string) => {
    if (!msg.trim()) return;
    
    // Check if user is logged in
    const session = await authService.getSession();
    if (!session) {
      // Store prompt for later
      sessionStorage.setItem("pendingPrompt", msg.trim());
      router.push(`/auth?next=/workspace`);
      return;
    }

    router.push(`/workspace?prompt=${encodeURIComponent(msg.trim())}`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-blue-500/30 overflow-hidden">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)" }}
        />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[400px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)" }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2.5">
          <div className="size-8 bg-white rounded-lg flex items-center justify-center" style={{ boxShadow: "0 0 20px rgba(255,255,255,0.15)" }}>
            <MdOutlineAutoAwesome size={17} color="#000" />
          </div>
          <span className="text-[17px] font-bold tracking-tight">OpenUx</span>
        </div>
        <div className="flex items-center gap-7">
          <a href="#" className="text-white/25 hover:text-white/70 transition-colors" aria-label="Twitter"><FaXTwitter size={18} /></a>
          <a href="#" className="text-white/25 hover:text-white/70 transition-colors" aria-label="GitHub"><FaGithub size={18} /></a>
          <a href="#" className="text-white/25 hover:text-white/70 transition-colors" aria-label="Discord"><FaDiscord size={18} /></a>
          <div className="w-px h-4 bg-white/10" />
          <button
            className="flex justify-center items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors py-2.5!"
            style={{ background: "transparent", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "6px 14px", color: "rgba(255,255,255,0.6)" }}
          >
            <BookOpen size={13} />
            Documentation
          </button>
          {!user ? (
            <button 
              onClick={() => router.push("/auth")}
              className="text-sm font-semibold px-4 py-2 bg-white text-black rounded-full hover:bg-white/90 transition-all py-2.5!" 
              style={{ boxShadow: "0 0 20px rgba(255,255,255,0.12)" }}
            >
              Get Started
            </button>
          ) : (
            <button 
              onClick={() => router.push("/workspace")}
              className="text-sm font-semibold px-4 py-2 bg-white/5 border border-white/10 text-white/70 rounded-full hover:bg-white/10 transition-all py-2.5!" 
            >
              Workspace
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-24 pt-8">

        {/* Badge */}
        {/* <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-white/60 font-medium"
        >
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Now in open beta — start building for free
        </motion.div> */}

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-center text-6xl md:text-[88px] font-bold leading-[1.05] mb-4 max-w-3xl"
          style={{
            letterSpacing: "-0.03em",
            background: "linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.35))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Think it. Build it.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-base md:text-lg text-white/40 max-w-lg mx-auto mb-12 leading-relaxed"
        >
          Describe your product. OpenUx turns it into a structured AI workflow — ready to build with any model.
        </motion.p>

        {/* Prompt box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full max-w-2xl"
        >
          <MessageInput
            message={message}
            setMessage={setMessage}
            isProcessing={false}
            selectedAgent="gemini-2.5-flash"
            onSend={handleSend}
            newChatOption={true}
          />
        </motion.div>

        {/* Suggestion chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-2xl"
        >
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setMessage(s)}
              style={{
                background: "transparent",
                border: "0.5px solid rgba(255,255,255,0.1)",
                borderRadius: 999,
                padding: "8px 15px",
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              {s}
            </button>
          ))}
        </motion.div>

        {false && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-20 flex flex-col items-center gap-4"
          >
            <p className="text-xs text-white/25 uppercase tracking-widest font-medium">Works with</p>
            <div className="flex items-center gap-8" style={{ opacity: 0.45 }}>
              {["Gemini", "Claude", "GPT-4o", "Llama", "Codex"].map((model) => (
                <span key={model} className="text-sm font-semibold tracking-tight" style={{ color: "rgba(255,255,255,0.8)" }}>{model}</span>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
