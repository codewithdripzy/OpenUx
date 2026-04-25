"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
}

interface ToastContextType {
    toast: {
        success: (title: string, description?: string) => void;
        error: (title: string, description?: string) => void;
        info: (title: string, description?: string) => void;
    };
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, title: string, description?: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, title, description }]);
        setTimeout(() => removeToast(id), 5000);
    }, [removeToast]);

    const toast = {
        success: (title: string, description?: string) => addToast("success", title, description),
        error: (title: string, description?: string) => addToast("error", title, description),
        info: (title: string, description?: string) => addToast("info", title, description),
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            layout
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            className="pointer-events-auto"
                        >
                            <div className={`flex items-start gap-3 p-4 rounded-xl border min-w-[300px] max-w-[400px] shadow-2xl backdrop-blur-xl ${
                                t.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-200" :
                                t.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200" :
                                "bg-blue-500/10 border-blue-500/20 text-blue-200"
                            }`}>
                                <div className="mt-0.5">
                                    {t.type === "error" && <AlertCircle size={18} />}
                                    {t.type === "success" && <CheckCircle size={18} />}
                                    {t.type === "info" && <Info size={18} />}
                                </div>
                                <div className="flex-1 flex flex-col gap-1">
                                    <h4 className="text-sm font-bold">{t.title}</h4>
                                    {t.description && <p className="text-xs opacity-70 leading-relaxed">{t.description}</p>}
                                </div>
                                <button 
                                    onClick={() => removeToast(t.id)}
                                    className="p-1 hover:bg-white/5 rounded-md transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        // Fallback for parts of the app not wrapped in Provider
        return {
            toast: {
                error: (title: string, description?: string) => console.error(title, description),
                success: (title: string, description?: string) => console.log(title, description),
                info: (title: string, description?: string) => console.info(title, description),
            }
        };
    }
    return context;
}
