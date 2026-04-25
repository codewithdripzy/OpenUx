"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

export default function LoadingOverlay({ isVisible, message }: LoadingOverlayProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
                >
                    <div className="flex flex-col items-center gap-6">
                        {/* Minimalist Loader */}
                        <div className="relative size-10">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border-2 border-white/10 border-t-white"
                            />
                        </div>

                        {/* Minimalist Text */}
                        <div className="flex flex-col items-center gap-1">
                            <h2 className="text-sm font-medium text-white/90">
                                {message || "Building your workspace"}
                            </h2>
                            <p className="text-[12px] text-white/30">
                                Cooking...
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
