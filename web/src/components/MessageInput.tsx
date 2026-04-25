"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HiSparkles } from "react-icons/hi";
import { agentService } from "@/services/agent.service";
import { AgentData, PromptData, NodeData } from "@/core/interfaces/data";
import { useState, useRef, useEffect, useCallback } from "react";
import { Paperclip, SendHorizonal, ChevronUp, Globe, X, FileText, Image as ImageIcon, Check } from "lucide-react";

interface UploadedFile {
    file: File;
    preview?: string;
    type: 'image' | 'document';
}

interface MessageInputProps {
    message: string;
    newChatOption?: boolean;
    isProcessing: boolean;
    placeholder?: string;
    selectedAgent: string | null;
    // agents: AgentData[];
    onAgentsLoad?: (agents: AgentData[]) => void;
    setMessage: (message: string) => void;
    onAgentChange?: (agent: string) => void;
    onSend: (message: string, tools: PromptData["tools"], files?: File[]) => void;
    nodes?: NodeData[];
}

// What do you think about GitPaid as an idea where developers earn rewards automatically from their code contributions and activity on Git without changing how they already work
export default function MessageInput({
    message,
    isProcessing,
    newChatOption = false,
    placeholder = "What do you want to build?",
    selectedAgent = "gemini-2.5-flash",
    setMessage,
    onSend,
    onAgentsLoad,
    onAgentChange,
    nodes = []
}: MessageInputProps) {
    const [tools, setTools] = useState<PromptData["tools"]>({
        deepReasoning: false,
        search: false,
    });
    const [agents, setAgents] = useState<AgentData[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionSearch, setMentionSearch] = useState("");
    const [mentionIndex, setMentionIndex] = useState(0);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mentionsRef = useRef<HTMLDivElement>(null);

    const filteredNodes = nodes.filter(node => 
        (node.pageSlug || node.pageName || "").toLowerCase().includes(mentionSearch.toLowerCase())
    );

    const handleSend = () => {
        if ((message.trim() || uploadedFiles.length > 0) && !isProcessing) {
            onSend(message, tools, uploadedFiles.map(f => f.file));
            setMessage("");
            setUploadedFiles([]);
        }
    };

    const handleFileSelect = useCallback((files: FileList | null) => {
        if (!files) return;

        const newFiles: UploadedFile[] = [];
        const maxFiles = 5;
        const currentCount = uploadedFiles.length;

        Array.from(files).slice(0, maxFiles - currentCount).forEach(file => {
            const isImage = file.type.startsWith('image/');
            const uploadedFile: UploadedFile = {
                file,
                type: isImage ? 'image' : 'document',
            };

            if (isImage) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setUploadedFiles(prev =>
                        prev.map(f =>
                            f.file === file
                                ? { ...f, preview: e.target?.result as string }
                                : f
                        )
                    );
                };
                reader.readAsDataURL(file);
            }

            newFiles.push(uploadedFile);
        });

        setUploadedFiles(prev => [...prev, ...newFiles]);
    }, [uploadedFiles.length]);

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const fetchAgents = async () => {
        const agentRes = await agentService.getAllAgents();
        const { data } = agentRes;

        if (data) {
            setAgents(data);
            onAgentsLoad?.(data);
            // set the first agent as default
            onAgentChange?.(data[1].uid);
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "inherit";
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
        }

        // Handle mention logic
        const lastChar = message[message.length - 1];
        const lastWord = message.split(/\s/).pop() || "";

        if (lastWord.startsWith("@")) {
            setShowMentions(true);
            setMentionSearch(lastWord.slice(1));
        } else {
            setShowMentions(false);
        }
    }, [message]);

    const selectMention = (node: any) => {
        const words = message.split(/\s/);
        words.pop(); // remove the @part
        const newMsg = [...words, "@" + (node.pageSlug || node.pageName)].join(" ") + " ";
        setMessage(newMsg);
        setShowMentions(false);
        textareaRef.current?.focus();
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsModelDropdownOpen(false);
            }
            if (mentionsRef.current && !mentionsRef.current.contains(e.target as Node)) {
                setShowMentions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="max-w-6xl mx-auto w-full mb-4 sm:mb-8 md:px-2 sm:px-0">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative glass-strong rounded-[16px] sm:rounded-[24px] p-3 sm:p-4 shadow-2xl transition-all duration-300 ${isDragging
                    ? "scale-[1.01]"
                    : ""
                    }`}
            >
                <div className="flex flex-col gap-2">
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt,.md,.json,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.go,.rs"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                    />

                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={(e) => {
                            if (showMentions && filteredNodes.length > 0) {
                                if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setMentionIndex(prev => (prev + 1) % filteredNodes.length);
                                } else if (e.key === "ArrowUp") {
                                    e.preventDefault();
                                    setMentionIndex(prev => (prev - 1 + filteredNodes.length) % filteredNodes.length);
                                } else if (e.key === "Enter" || e.key === "Tab") {
                                    e.preventDefault();
                                    selectMention(filteredNodes[mentionIndex]);
                                } else if (e.key === "Escape") {
                                    setShowMentions(false);
                                }
                            } else if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={placeholder}
                        style={{ border: "none", outline: "none", padding: "6px 8px", fontSize: "inherit", boxShadow: "none" }}
                        className="w-full bg-transparent text-white/90 text-[13px] sm:text-[13.5px]! leading-relaxed resize-none placeholder:text-white/25 custom-scrollbar min-h-[40px] sm:min-h-[44px]"
                    />

                    {/* Mentions Dropdown */}
                    <AnimatePresence>
                        {showMentions && filteredNodes.length > 0 && (
                            <motion.div
                                ref={mentionsRef}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-full left-0 mb-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]"
                            >
                                <div className="p-1 max-h-48 overflow-y-auto custom-scrollbar">
                                    {filteredNodes.map((node, i) => (
                                        <div
                                            key={node.uid}
                                            onClick={() => selectMention(node)}
                                            onMouseEnter={() => setMentionIndex(i)}
                                            className={`flex flex-col px-3 py-2 rounded-lg cursor-pointer transition-colors ${mentionIndex === i ? "bg-white/10" : "hover:bg-white/5"}`}
                                        >
                                            <span className="text-xs font-medium text-white/90">{node.pageName || node.title}</span>
                                            <span className="text-[10px] text-white/40 font-mono">{node.pageSlug}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* File Previews */}
                    <AnimatePresence>
                        {uploadedFiles.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex gap-2 overflow-x-auto pb-2 px-1 custom-scrollbar pt-2"
                            >
                                {uploadedFiles.map((file, index) => (
                                    <motion.div
                                        key={`${file.file.name}-${index}`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="relative flex-shrink-0 group"
                                    >
                                        {file.type === 'image' ? (
                                            <div className="relative size-[50px] sm:size-[60px] rounded-xl overflow-hidden bg-white/5 border border-white/10">
                                                {file.preview ? (
                                                    <img
                                                        src={file.preview}
                                                        alt={file.file.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <ImageIcon size={24} className="text-white/30" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="h-[70px] sm:h-[80px] px-3 sm:px-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 sm:gap-3">
                                                <FileText size={18} className="text-white/50 sm:w-5 sm:h-5" />
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] sm:text-xs text-white/70 max-w-[80px] sm:max-w-[100px] truncate">
                                                        {file.file.name}
                                                    </span>
                                                    <span className="text-[9px] sm:text-[10px] text-white/30">
                                                        {formatFileSize(file.file.size)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {/* Remove button */}
                                        <div
                                            onClick={() => removeFile(index)}
                                            className="absolute -top-1.5 -right-1.5 size-5 bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80 cursor-pointer"
                                        >
                                            <X size={12} className="text-white" />
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>


                    <div className="flex items-center justify-between px-1 gap-2">
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink min-w-0">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white/70 group cursor-pointer flex-shrink-0"
                                title="Attach files"
                            >
                                <Paperclip size={18} className="group-hover:rotate-12 transition-transform" />
                            </div>

                            {false && <>
                                <div className="h-4 w-[1px] bg-white/10 mx-0.5 sm:mx-1 hidden sm:block" />

                                <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-full transition-all text-xs cursor-pointer flex-shrink-0 ${tools.search ? "bg-blue-400/5 text-blue-400/70" : "hover:bg-white/5 text-white/40 hover:text-white/70"}`} onClick={() => setTools((prev) => ({ ...prev, search: !prev.search }))}>
                                    <Globe size={14} />
                                    <span className="font-medium hidden sm:inline">Search</span>
                                </div>

                                <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-full transition-all text-xs cursor-pointer flex-shrink-0 ${tools.deepReasoning ? "bg-blue-400/5 text-blue-400/70" : "hover:bg-white/5 text-white/40 hover:text-white/70"}`} onClick={() => setTools((prev) => ({ ...prev, deepReasoning: !prev.deepReasoning }))}>
                                    <HiSparkles size={14} />
                                    <span className="font-medium hidden sm:inline">Deep Thinking</span>
                                </div>
                            </>}
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            {/* Model Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <div
                                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                    className="px-2 sm:px-3 py-2 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-white/40 hover:text-white/60 font-medium cursor-pointer hover:bg-white/5 rounded-md transition-colors max-w-[100px] sm:max-w-none"
                                >
                                    <span className="truncate">{agents.find(a => a.uid === selectedAgent)?.name}</span>
                                    <motion.div
                                        animate={{ rotate: isModelDropdownOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex-shrink-0"
                                    >
                                        <ChevronUp size={12} />
                                    </motion.div>
                                </div>

                                <AnimatePresence>
                                    {isModelDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute bottom-full right-0 mb-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                                        >
                                            <div className="p-1">
                                                {agents.map((agent) => (
                                                    <div
                                                        key={agent.uid}
                                                        onClick={() => {
                                                            onAgentChange?.(agent.uid);
                                                            setIsModelDropdownOpen(false);
                                                        }}
                                                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${selectedAgent === agent.uid
                                                            ? "bg-white/10 text-white"
                                                            : "hover:bg-white/5 text-white/70"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[12px]">{agent.name}</span>
                                                            {agent.tag && (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                                                                    {agent.tag}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {selectedAgent === agent.uid && (
                                                            <Check size={14} className="text-blue-400" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <motion.div
                                whileHover={{ scale: isProcessing ? 1 : 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={isProcessing ? undefined : handleSend}
                                className={`size-9 sm:size-10 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer flex-shrink-0 ${(message.trim() || uploadedFiles.length > 0) && !isProcessing
                                    ? "bg-white text-black hover:bg-white/90"
                                    : "bg-white/5 text-white/20 cursor-not-allowed"
                                    }`}
                            >
                                {isProcessing ? <div className="spinner border-t-white! size-[16px]!" /> : <SendHorizonal size={16} className="sm:w-[18px] sm:h-[18px]" />}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
            {!newChatOption && <motion.p
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-[11px] text-white/20 text-center mt-3 font-medium">
                OpenUx can make mistakes. Check important info.
            </motion.p>}
        </div>
    );
}
