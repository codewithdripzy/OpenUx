"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GitMerge, Sparkles } from 'lucide-react';

interface MultiBranchViewProps {
  chatId: string | null;
  activeBranch: { active: boolean; nodeId: string | null };
  updateChat: (chat: any) => void;
  onClose: () => void;
}

export const MultiBranchView: React.FC<MultiBranchViewProps> = ({
  chatId,
  activeBranch,
  updateChat,
  onClose,
}) => {
  if (!activeBranch.active) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <GitMerge size={20} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Multi-Branch Generation</h2>
                <p className="text-sm text-white/40">Generate multiple design paths simultaneously</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="size-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8 flex flex-col items-center justify-center text-center gap-6">
            <div className="size-20 bg-white/[0.02] rounded-full flex items-center justify-center border border-white/5">
              <Sparkles size={32} className="text-emerald-500/40" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-white/90">Experimental Feature</h3>
              <p className="text-sm text-white/40 max-w-sm">
                Multi-branching allows you to explore multiple design decisions at once. This feature is currently being refined.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-all"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
