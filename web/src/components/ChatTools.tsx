"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, GitMerge, Trash2, X } from 'lucide-react';

interface ChatToolsProps {
  show: boolean;
  selectedNodes: string[];
  onClose: () => void;
  onSelect: (tool: string) => void;
  isDeletable?: boolean;
}

const ChatTools: React.FC<ChatToolsProps> = ({
  show,
  selectedNodes,
  onClose,
  onSelect,
  isDeletable = true,
}) => {
  if (!show) return null;

  const tools = [
    {
      id: 'branch',
      name: 'Branch',
      icon: <GitBranch size={16} />,
      description: 'Create a new path from this thought',
      color: 'text-blue-400',
      bg: 'hover:bg-blue-500/10',
    },
    {
      id: 'multi-branch',
      name: 'Multi-Branch',
      icon: <GitMerge size={16} />,
      description: 'Split this thought into multiple paths',
      color: 'text-emerald-400',
      bg: 'hover:bg-emerald-500/10',
    },
    {
      id: 'delete',
      name: 'Delete',
      icon: <Trash2 size={16} />,
      description: 'Remove this thought and its children',
      color: 'text-red-400',
      bg: 'hover:bg-red-500/10',
      hidden: !isDeletable,
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 40 }}
        exit={{ opacity: 0, scale: 0.9, x: 20 }}
        className="absolute top-1/2 -translate-y-1/2 z-[100] min-w-[220px] bg-[#1a1a1a] border border-white/10 rounded-2xl p-2 shadow-2xl"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 mb-1">
          <span className="text-[11px] font-bold text-white/40">Tools</span>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
        
        <div className="flex flex-col gap-1">
          {tools.filter(t => !t.hidden).map((tool) => (
            <button
              key={tool.id}
              onClick={() => onSelect(tool.id)}
              className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-all ${tool.bg} group`}
            >
              <div className={`size-8 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/5 ${tool.color} group-hover:scale-110 transition-transform`}>
                {tool.icon}
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[13px] font-semibold text-white/90">{tool.name}</span>
                <span className="text-[10px] text-white/30">{tool.description}</span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatTools;
