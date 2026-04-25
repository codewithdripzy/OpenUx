import moment from "moment";
// import ChatTools from "./ChatTools";
// import { projectService } from "@/services/project.service";

import { AnimatePresence, motion } from "framer-motion";
import { Connector } from "./Connector";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/providers/SidebarProvider";
import { NodeData, AgentData, ChatData, NodeRef, NodeThinkingData } from "@/core/interfaces/data";
import { useEffect, useRef, createRef, useState, useCallback } from "react";
import { ChevronDown, Ellipsis, ExternalLink, MessageCircleDashed, Plus, Trash2, Zap, Crown } from "lucide-react";
import ChatTools from "@/views/ChatTools";

// Helper function to get the ID from a NodeRef (handles both string IDs and populated objects)
const getNodeRefId = (ref: NodeRef): string => {
    if (typeof ref === "string") return ref;
    return ref.id;
};

// Helper function to check if a node ID is in a connections/parents array
const hasNodeRef = (refs: NodeRef[], nodeId: string): boolean => {
    return refs.some(ref => getNodeRefId(ref) === nodeId);
};

// Typewriter effect component for agent responses
function TypewriterText({ text, speed = 15, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let currentIndex = 0;
        setDisplayedText("");
        setIsComplete(false);

        const interval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText(text.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                clearInterval(interval);
                setIsComplete(true);
                onComplete?.();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return (
        <span>
            {displayedText}
            {!isComplete && <span className="animate-pulse">|</span>}
        </span>
    );
}

interface ChatCanvasProps {
    activeChat: ChatData | null;
    nodes: NodeData[];
    agents?: AgentData[];
    activeNodes: string[];
    processingNodeIds: string[];
    thinkingUpdatesByNode?: Record<string, NodeThinkingData[]>;
    expandedNodes: Record<string, boolean>;
    onExpandedNodesChange: (expandedNodes: Record<string, boolean>) => void;
    updateChat: (chat: ChatData) => void,
    setActiveNodes: (nodeIds: string[]) => void;
    onMultiBranchOpen: (nodeId: string) => void;
    onNodeOpen?: (nodeId: string) => void;
}

function ChatCanvas({ activeChat, nodes, activeNodes, processingNodeIds, thinkingUpdatesByNode = {}, expandedNodes, onExpandedNodesChange, setActiveNodes, onMultiBranchOpen, onNodeOpen, updateChat }: ChatCanvasProps) {
    const chatId = activeChat ? activeChat.uid : null;
    const containerRef = useRef<HTMLDivElement>(null);
    const animatedMessagesRef = useRef<Set<string>>(new Set());
    const refs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

    const { toast } = useToast();
    const { canBranchNode } = useSidebar();

    const [showTool, setShowTool] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [activeProcessing, setActiveProcessing] = useState<"branching" | "multi-branching" | "deleting" | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

    // Track which messages should animate (new agent messages)
    const shouldAnimateMessage = useCallback((messageId: string, sender: string, messages?: any[]) => {
        if (sender !== "agent") return false;
        if (animatedMessagesRef.current.has(messageId)) return false;
        // Only animate the last agent message
        if (!messages) return false;
        // Find last agent message
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].sender === "agent") {
                const lastAgentKey = messages[i].id || `${messages[i].uid || ""}-${i}`;
                return lastAgentKey === messageId;
            }
        }
        return false;
    }, []);

    const markMessageAnimated = useCallback((messageId: string) => {
        animatedMessagesRef.current.add(messageId);
    }, []);

    const isExpanded = (uid: string) => expandedNodes[uid] || false;

    useEffect(() => {
        let draggingId: string | null = null;
        let offsetX = 0;
        let offsetY = 0;

        const container = containerRef.current;
        if (!container) return;

        function handleMouseDown(event: MouseEvent, uid: string) {
            // prevent drag when clicking on inputs, textareas, or other editable elements
            if ((event.target as HTMLElement).tagName === "INPUT" ||
                (event.target as HTMLElement).tagName === "TEXTAREA" ||
                (event.target as HTMLElement).isContentEditable) {
                return; // don’t start dragging
            }

            const el = refs.current[uid]?.current;
            if (!el) return;

            const rect = el.getBoundingClientRect();
            offsetX = event.clientX - rect.left;
            offsetY = event.clientY - rect.top;
            draggingId = uid;

            event.preventDefault(); // only prevent default if actually dragging
        }

        function handleMouseMove(event: MouseEvent) {
            if (draggingId === null) return;
            const el = refs.current[draggingId]?.current;
            if (!el) return;
            if (!container) return;

            const containerBox = container.getBoundingClientRect();

            // Position relative to the container
            const x = event.clientX - containerBox.left - offsetX;
            const y = event.clientY - containerBox.top - offsetY;

            el.style.position = "absolute";
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
        }

        function handleMouseUp(event: MouseEvent) {
            if (draggingId === null) return;

            const el = refs.current[draggingId]?.current;
            if (!el) return;
            if (!container) return;

            const containerBox = container.getBoundingClientRect();

            // Position relative to the container
            const x = event.clientX - containerBox.left - offsetX;
            const y = event.clientY - containerBox.top - offsetY;

            console.log(`Moving block ${draggingId} to (${x}, ${y})`);
            draggingId = null;
        }

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        // Attach mousedown to each block and keep a reference so we can clean up
        const mouseDownHandlers: [HTMLElement, EventListener][] = [];

        nodes.forEach((node) => {
            const el = refs.current[node.uid]?.current;
            if (el) {
                const handler = (e: Event) => handleMouseDown(e as MouseEvent, node.uid);
                el.addEventListener("mousedown", handler);
                mouseDownHandlers.push([el, handler]);
            }
        });

        // Cleanup listeners
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            mouseDownHandlers.forEach(([el, handler]) =>
                el.removeEventListener("mousedown", handler)
            );
        };
    }, [nodes, expandedNodes]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setActiveNodes([]);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [setActiveNodes]);

    const deleteNode = async (nodeId: string) => {
        try {
            if (!chatId) return toast.error("Conversation not found");
            // const { success, message, data } = await nodeService.deleteNode(chatId, nodeId);
            // if (!success) {
            //     toast.error(message);
            //     return;
            // };

            // updateChat(data);
            // remove the ref for the deleted node
            delete refs.current[nodeId];
        } catch (error) {
            console.error(error);
        } finally {
            setActiveProcessing(null);
        }
    }

    const handleToolSelect = (tool: string, nodeId: string) => {
        setShowTool(null);

        switch (tool) {
            case "branch":
                setActiveProcessing("branching");
                // branchNode(nodeId);
                break;
            case "multi-branch":
                setActiveProcessing("multi-branching");
                onMultiBranchOpen(nodeId);
                break;
            case "delete":
                setActiveProcessing("deleting");
                deleteNode(nodeId);
                break;
            default:
                break;
        }
    };

    return <div ref={containerRef} className='workflow-canvas relative min-h-[4000px] min-w-[4000px]'>
        {nodes.length > 0 && nodes.map((node) => {
            const blockRef = refs.current[node.uid] || createRef();
            refs.current[node.uid] = blockRef;

            const hasLeftConnection = nodes.some(otherNode => otherNode.connections && hasNodeRef(otherNode.connections, node.uid));
            const hasRightConnection = node.connections && node.connections.length > 0;

            return <div key={node.uid} onClick={(e) => {
                e.preventDefault();
                if (e.shiftKey) {
                    if (activeNodes.includes(node.uid)) {
                        setActiveNodes(activeNodes.filter(id => id !== node.uid))
                    } else {
                        setActiveNodes([...activeNodes, node.uid])
                    }
                } else {
                    if (activeNodes.includes(node.uid)) {
                        if (activeNodes.length > 1) {
                            setActiveNodes([node.uid])
                        } else {
                            setActiveNodes([])
                        }
                        setShowTool(null)
                    } else {
                        setActiveNodes([node.uid])
                        setShowTool(null)
                    }
                }
            }} onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onNodeOpen?.(node.uid);
            }}>
                <div key={node.uid} className={`workblock absolute z-10 bg-[#121212] border border-white/5 rounded-2xl min-w-[280px] max-w-[400px] shadow-2xl transition-all ${activeNodes.includes(node.uid) ? 'border-blue-500/50 shadow-blue-500/10' : ''}`} ref={blockRef} style={{ top: node.position.y, left: node.position.x }}>
                    <div className={`flex items-center justify-between px-3.5 py-3 w-full border-b border-white/5 group`}>
                        <div className="flex justify-center items-center gap-2.5">
                            <div className='block-icon size-6 bg-emerald-500/10 rounded-lg flex items-center justify-center'>
                                <Zap size={13} className="text-emerald-500" />
                            </div>
                            <div className='flex mr-2 text-white/90 font-semibold text-[13px] tracking-tight'>
                                {node.title}
                            </div>
                        </div>
                        <div className='flex items-center justify-center gap-2'>
                            {!isExpanded(node.uid) && <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNodeOpen?.(node.uid);
                                }}
                                className="hidden group-hover:flex items-center gap-1.5 text-[11px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                            >
                                <ExternalLink size={11} />
                                View
                            </button>}
                            <div className='flex items-center gap-[5px]'>
                                {node.parents && node.parents.length > 0 && <div className="relative">
                                    <div className="flex items-center justify-center size-7 cursor-pointer hover:bg-white/5 rounded-full transition-colors" onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteModal(showDeleteModal === node.uid ? null : node.uid)
                                    }}>
                                        <Ellipsis size={14} className="text-white/40" />
                                    </div>
                                    {showDeleteModal === node.uid && (
                                        <div className="absolute top-full left-0 mt-2 flex items-center justify-center w-[160px] rounded-xl bg-[#1a1a1a] border border-white/10 p-1 z-[100] shadow-2xl">
                                            <div className="flex justify-start items-center gap-2.5 hover:bg-red-500/10 text-red-500 p-2.5 w-full rounded-lg cursor-pointer text-[12px] transition-colors" onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNode(node.uid);
                                                setShowDeleteModal(null);
                                            }}>
                                                <Trash2 size={15} />
                                                <span className="font-medium">Delete Node</span>
                                            </div>
                                        </div>
                                    )}
                                </div>}
                                <div className="flex items-center justify-center size-7 cursor-pointer hover:bg-white/5 rounded-full transition-colors" onClick={(e) => {
                                    e.stopPropagation();
                                    onExpandedNodesChange({ ...expandedNodes, [node.uid]: !expandedNodes[node.uid] });
                                }}>
                                    <ChevronDown size={14} className={`${isExpanded(node.uid) ? "rotate-180" : ""} transition-transform duration-300 text-white/40`} />
                                </div>
                            </div>
                        </div>
                    </div>
                    {isExpanded(node.uid) && <div className="flex w-full p-3.5">
                        <div className="flex flex-col gap-4 bg-white/[0.02] p-4 w-full rounded-xl min-h-[100px] border border-white/5">
                            {node.context && node.messages && node.messages.length > 0 && <q className="text-white/40 text-[11px] italic leading-relaxed">{node.context}</q>}
                            {node.messages && node.messages.length > 0 ? <div className="flex flex-col gap-5">
                                {node.messages.map((message, index) => {
                                    const messageKey = message.id || `${node.uid}-${index}`;
                                    const shouldAnimate = shouldAnimateMessage(messageKey, message.sender, node.messages);
                                    
                                    return (
                                        <div key={messageKey} className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`size-1.5 rounded-full ${message.sender === "user" ? "bg-blue-400" : "bg-emerald-400"}`} />
                                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{message.sender === "user" ? "User" : "Agent"}</span>
                                            </div>
                                            <p className="text-[12px] text-white/70 leading-relaxed ml-4">
                                                {shouldAnimate ? (
                                                    <TypewriterText 
                                                        text={message.content.length > 120 ? message.content.slice(0, 120) + "..." : message.content} 
                                                        onComplete={() => markMessageAnimated(messageKey)}
                                                    />
                                                ) : (
                                                    message.content.length > 120 ? message.content.slice(0, 120) + "..." : message.content
                                                )}
                                            </p>
                                        </div>
                                    );
                                })}
                                {processingNodeIds.includes(node.uid) && (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Agent</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 ml-4">
                                            <span className="flex gap-1">
                                                <span className="size-1 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="size-1 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="size-1 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div> : (
                                <div className="flex flex-col items-center justify-center gap-4 h-[180px]">
                                    <div className="size-12 bg-white/[0.02] rounded-full flex items-center justify-center border border-white/5">
                                        <MessageCircleDashed size={24} className="text-white/20" />
                                    </div>
                                    <div className="flex flex-col gap-1 items-center text-center">
                                        <div className="text-[14px] text-white/90 font-medium">No conversation yet</div>
                                        <div className="text-[11px] text-white/30 max-w-[200px] leading-relaxed">Ask a question or describe a change to this node to begin.</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>}
                    {isExpanded(node.uid) && <div className="flex items-center justify-between w-full px-5 pb-4">
                        <span className="text-[10px] text-white/20 font-medium">Updated {moment(node.updatedAt).fromNow()}</span>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onNodeOpen?.(node.uid);
                            }}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <ExternalLink size={13} />
                            Full Chat
                        </button>
                    </div>}

                    <div className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center'>
                        <div className='flex justify-center items-center size-8 bg-[#121212] rounded-full border border-white/10 cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all shadow-xl group' onClick={(e) => {
                            e.stopPropagation();
                            setShowTool(showTool === node.uid ? null : node.uid)
                        }}>
                            <Plus size={16} className="text-white/60 group-hover:text-white transition-colors" />
                        </div>
                    </div>

                    <ChatTools
                        show={showTool === node.uid}
                        selectedNodes={activeNodes}
                        onClose={() => setShowTool(null)}
                        isDeletable={node.parents && node.parents.length > 0}
                        onSelect={(tool: string) => handleToolSelect(tool, node.uid)}
                    />
                </div>
                {node.connections && node.connections.map((connection) => {
                    const toId = getNodeRefId(connection);
                    const targetNodeExists = nodes.some(n => n.uid === toId);
                    if (!targetNodeExists) return null;

                    const toRef = refs.current[toId] || createRef();
                    refs.current[toId] = toRef;

                    return <Connector key={`${node.uid}-${toId}`} containerRef={containerRef} fromRef={blockRef} toRef={toRef} bend={100} color="rgba(255,255,255,0.1)" />
                })}
            </div>
        })}

        <AnimatePresence>
            {activeProcessing === "branching" && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-8 right-8 flex items-center justify-center gap-3 bg-white text-black rounded-2xl px-6 py-4 z-[100] shadow-2xl font-bold text-sm">
                <div className="size-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Branching...
            </motion.div>}
        </AnimatePresence>
    </div >
}

export default ChatCanvas;
