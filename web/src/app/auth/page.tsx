"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { FaGoogle, FaGithub, FaXTwitter } from "react-icons/fa6";
import { authService } from "@/services/auth.service";

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleLogin = async (provider: 'google' | 'github' | 'x') => {
        setIsLoading(provider);
        try {
            let res;
            if (provider === 'google') res = await authService.signInWithGoogle();
            else if (provider === 'github') res = await authService.signInWithGithub();
            else if (provider === 'x') res = await authService.signInWithX();

            if (res) {
                // If there's a stored prompt, the workspace will pick it up
                const next = searchParams.get("next") || "/workspace";
                router.push(next);
            }
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-blue-500/30 items-center justify-center overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
                style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-sm flex flex-col gap-8 p-8"
            >
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="size-12 bg-white rounded-xl flex items-center justify-center">
                        <MdOutlineAutoAwesome size={24} color="#000" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-2xl font-bold tracking-tight">Welcome to OpenUx</h1>
                        <p className="text-sm text-white/40">Sign in to start building your AI architecture</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => handleLogin('google')}
                        disabled={!!isLoading}
                        className="flex items-center justify-center gap-3 w-full py-3 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-all disabled:opacity-50"
                    >
                        {isLoading === 'google' ? <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <FaGoogle size={18} />}
                        Continue with Google
                    </button>
                    
                    <button
                        onClick={() => handleLogin('github')}
                        disabled={!!isLoading}
                        className="flex items-center justify-center gap-3 w-full py-3 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        {isLoading === 'github' ? <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <FaGithub size={18} />}
                        Continue with GitHub
                    </button>

                    <button
                        onClick={() => handleLogin('x')}
                        disabled={!!isLoading}
                        className="flex items-center justify-center gap-3 w-full py-3 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        {isLoading === 'x' ? <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <FaXTwitter size={18} />}
                        Continue with X
                    </button>
                </div>

                <p className="text-[11px] text-center text-white/20 leading-relaxed">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="size-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        }>
            <AuthContent />
        </Suspense>
    );
}
