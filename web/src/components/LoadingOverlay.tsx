"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineAutoAwesome } from "react-icons/md";

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

export default function LoadingOverlay({ isVisible, message = "Building your workspace..." }: LoadingOverlayProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
                >
                    <div className="relative">
                        {/* Outer rotating ring */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="size-24 rounded-full border-t-2 border-r-2 border-white/20 border-t-blue-500"
                        />
                        
                        {/* Inner rotating ring (opposite direction) */}
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 rounded-full border-b-2 border-l-2 border-white/10 border-b-purple-500"
                        />

                        {/* Center logo */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <MdOutlineAutoAwesome size={32} className="text-white" />
                            </motion.div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 flex flex-col items-center gap-2"
                    >
                        <h2 className="text-xl font-bold tracking-tight text-white">{message}</h2>
                        <div className="flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ 
                                        scale: [1, 1.5, 1],
                                        opacity: [0.3, 1, 0.3]
                                    }}
                                    transition={{ 
                                        duration: 1, 
                                        repeat: Infinity, 
                                        delay: i * 0.2 
                                    }}
                                    className="size-1.5 rounded-full bg-blue-500"
                                />
                            ))}
                        </div>
                    </motion.div>
                    
                    <p className="absolute bottom-12 text-[10px] text-white/10 font-medium">
                        OpenUx Generative Engine
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
