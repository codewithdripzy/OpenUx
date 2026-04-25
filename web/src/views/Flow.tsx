import moment from "moment";
import ChatTools from "./ChatTools";
import nodeService from "@/services/node.service";

import { AnimatePresence, motion } from "framer-motion";
import { Connector } from "@/components/Connector";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/providers/SidebarProvider";
import { NodeData, AgentData, ChatData, NodeRef, NodeThinkingData } from "@/core/interfaces/data";
import { useEffect, useRef, createRef, useState, useCallback } from "react";
import { ChevronDown, Ellipsis, ExternalLink, MessageCircleDashed, Plus, Trash2, Zap, Crown } from "lucide-react";

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

            // Update the position in the workflow state
            // dispatch(setWorkflows(workflows.map((block) => {
            //     if (block.uid === draggingId) {
            //         return {
            //             ...block,
            //             position: { x, y },
            //         };
            //     }
            //     return block;
            // })));

            draggingId = null;
        }

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        // Attach mousedown to each block and keep a reference so we can clean up
        const mouseDownHandlers: [HTMLElement, EventListener][] = [];

        nodes.forEach((node) => {
            const el = refs.current[node.id]?.current;
            if (el) {
                const handler = (e: Event) => handleMouseDown(e as MouseEvent, node.id);
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
    }, [nodes, refs, containerRef, expandedNodes]);

    useEffect(() => {
        // implemnt mult
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setActiveNodes([]);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const branchNode = async (nodeId: string) => {
        try {
            if (!chatId) return toast.error("Conversation not found", "The requested conversation does not exist, has been deleted, or you do not have access to it, create a new conversation to continue.");

            // Check plan limits before branching
            if (activeChat) {
                const { allowed, message } = canBranchNode(activeChat);
                if (!allowed) {
                    setShowUpgradeModal(true);
                    return;
                }
            }

            const { success, message, data } = await nodeService.branchNode(chatId, nodeId);
            if (!success) {
                toast.error(message);
                return;
            };

            updateChat(data);
        } catch (error) {
            console.error(error);
        } finally {
            setActiveProcessing(null);
        }
    }

    const deleteNode = async (nodeId: string) => {
        try {
            if (!chatId) return toast.error("Conversation not found", "The requested conversation does not exist, has been deleted, or you do not have access to it, create a new conversation to continue.");
            const { success, message, data } = await nodeService.deleteNode(chatId, nodeId);
            if (!success) {
                toast.error(message);
                return;
            };

            updateChat(data);
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
                branchNode(nodeId);
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

    return <div ref={containerRef} className='workflow-canvas relative'>
        {nodes.length > 0 && nodes.map((node) => {
            const blockRef = refs.current[node.id] || createRef();
            refs.current[node.id] = blockRef;

            // console.log(node.connections);
            const hasLeftConnection = nodes.some(otherNode => otherNode.connections && hasNodeRef(otherNode.connections, node.id));
            const hasRightConnection = node.connections && node.connections.length > 0;

            return <div key={node.uid} onClick={(e) => {
                // if(node.connections && node.connections.length > 0) return toast.info("Notice", "You're not allowed to prompt a branched thought. Please select an end thought or create a new branch to continue the conversation.");
                e.preventDefault();
                // e.stopPropagation();

                // check if shift is pressed
                if (e.shiftKey) {
                    if (activeNodes.includes(node.uid)) {
                        // (prev) => prev.filter((uid) => uid !== node.uid)
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
                        // setShowTool(node.uid)
                    }
                }
            }} onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Open full chat view for this thought
                onNodeOpen?.(node.uid);
            }}>
                <div key={node.uid} className={`workblock ${hasLeftConnection ? 'l-connected-block' : ''} ${hasRightConnection ? 'r-connected-block' : ''} ${activeNodes.includes(node.uid) ? 'border-[#1e90ff]!' : ''}`} ref={blockRef} style={{ top: node.position.y, left: node.position.x }}>
                    <div className={`flex items-center justify-between px-3 w-full my-[3px] group`}>
                        <div className="flex justify-center items-center gap-2.5">
                            {/* {node.metadata?.isStart ? <div className='block-icon trigger-icon'>
                                <Zap size={12} color='#00ab2b' />
                            </div> : node.blockId ? <Icon icon={node.blockId.icon ?? ""} className='block-icon trigger-icon' /> : <div className='block-icon trigger-icon'>
                                <Zap size={12} color='#00ab2b' />
                            </div>} */}
                            <div className='block-icon trigger-icon'>
                                <Zap size={12} color='#00ab2b' />
                            </div>
                            <div className='flex mr-2 text-[#eee] font-medium text-[12px]'>
                                {node.title}
                                {/* {node.metadata?.isConditionalConstant ? node.title : node.blockId?.name} */}
                            </div>
                        </div>
                        <div className='flex items-center justify-center gap-3'>
                            {!isExpanded(node.uid) && <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNodeOpen?.(node.uid);
                                }}
                                className="items-center gap-1.5 text-[10px]! px-2.5! py-[5px]! transition-colors group-hover:flex!"
                                style={{
                                    display: "none"
                                }}
                            >
                                <ExternalLink size={10} />
                                View
                            </button>}
                            <div className='flex items-center gap-[5px]'>
                                {/* <div className='cursor-pointer'>
                                        <Play size={14} />
                                    </div> */}
                                {node.parents && node.parents.length > 0 && <div className="relative">
                                    <div className="flex items-center justify-center size-[22px] cursor-pointer hover:bg-[#454545] rounded-full" onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteModal(showDeleteModal === node.uid ? null : node.uid)
                                    }}>
                                        <Ellipsis size={14} />
                                    </div>
                                    {showDeleteModal === node.uid && (
                                        <div className="absolute top-full left-full flex items-center justify-center w-[200px] rounded-[15px] bg-[#333333] p-[5px] z-1000">
                                            <div className="flex justify-start items-center gap-2.5 hover:bg-red-500/5 text-red-500 p-2.5 w-full rounded-[10px] cursor-pointer text-[12px]" onClick={(e) => {
                                                e.stopPropagation();

                                                setActiveProcessing("deleting");
                                                deleteNode(node.uid);
                                                // Handle delete action
                                                // setShowDeleteModal(null);
                                            }}>
                                                <Trash2 size={16} />
                                                <span>Delete</span>
                                            </div>
                                        </div>
                                    )}
                                </div>}
                                <div className="flex items-center justify-center size-[22px] cursor-pointer hover:bg-[#454545] rounded-full" onClick={(e) => {
                                    e.stopPropagation();
                                    onExpandedNodesChange({ ...expandedNodes, [node.uid]: !expandedNodes[node.uid] });
                                }}>
                                    <ChevronDown size={14} className={`${isExpanded(node.uid) ? "rotate-180" : ""} transition-transform duration-300`} />
                                </div>
                            </div>
                        </div>
                    </div>
                    {isExpanded(node.uid) && <div className="flex w-full pt-3 pb-2.5 px-4">
                        <div className="flex flex-col gap-4 bg-[#171717] p-3 w-full rounded-lg min-h-[100px]">
                            {/* <div>No Conversation Yet</div> */}
                            {/* Based on workstudio platform, user is asking about integrations and workflows, user needs help navigating around the platform */}
                            {node.context && node.messages && node.messages.length > 0 && <q className="text-[#ababab] text-[11px] italic">{node.context}</q>}
                            {node.messages && node.messages.length > 0 ? <div className="flex flex-col gap-4">
                                {node.messages.map((message, index) => {
                                    const messageKey = message.id || `${node.uid}-${index}`;
                                    const shouldAnimate = shouldAnimateMessage(messageKey, message.sender);

                                    return (
                                        <div key={messageKey} className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className={`size-1.5 rounded-full ${message.sender === "user" ? "bg-blue-400" : "bg-emerald-400"}`} />
                                                <span className="text-[10px] font-semibold text-[#666] uppercase tracking-tight">{message.sender === "user" ? "User" : "Agent"}</span>
                                            </div>
                                            <p className="text-[12px] text-[#aaa] leading-[18px] ml-3.5">
                                                {shouldAnimate ? (
                                                    <TypewriterText
                                                        text={message.content.length > 100 ? message.content.slice(0, 100) + "..." : message.content}
                                                        onComplete={() => markMessageAnimated(messageKey)}
                                                    />
                                                ) : (
                                                    message.content.length > 100 ? message.content.slice(0, 100) + "..." : message.content
                                                )}
                                            </p>
                                            {thinkingUpdatesByNode[node.uid]?.length > 0 && (
                                                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-blue-300/80">
                                                        <div className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                                                        Thinking
                                                    </div>
                                                    {thinkingUpdatesByNode[node.uid].map((update, index) => (
                                                        <div key={`${node.uid}-thinking-${index}`} className="text-[11px] leading-[18px] text-[#9bb6ff]">
                                                            {update.message}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {/* Show typing indicator when processing */}
                                {processingNodeIds.includes(node.uid) && (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-emerald-400" />
                                            <span className="text-[10px] font-semibold text-[#666] uppercase tracking-tight">Agent</span>
                                        </div>
                                        <div className="flex items-center gap-1 ml-3.5">
                                            <span className="flex gap-1">
                                                <span className="size-1.5 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="size-1.5 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="size-1.5 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div> : <div className="flex flex-col gap-4">
                                {processingNodeIds.includes(node.uid) ? (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-emerald-400" />
                                            <span className="text-[10px] font-semibold text-[#666] uppercase tracking-tight">Agent</span>
                                        </div>
                                        <div className="flex items-center gap-1 ml-3.5">
                                            <span className="flex gap-1">
                                                <span className="size-1.5 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="size-1.5 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="size-1.5 bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-3 h-[150px]">
                                        <MessageCircleDashed size={35} className="text-[#777]" />
                                        <div className="flex flex-col gap-0.5 items-center text-center justify-center">
                                            <div className="text-[13px] text-[#eee] leading-[18px]">No conversation yet</div>
                                            <div className="text-[11px] text-[#aaa] leading-[18px]">Click on this thought and start a conversation by asking a question or sharing a file</div>
                                        </div>
                                    </div>
                                )}
                            </div>}
                        </div>
                    </div>}
                    {isExpanded(node.uid) && <div className="flex items-center justify-between w-full px-5 mb-1">
                        <span className="text-[10px] text-[#666]">Last updated {moment(node.updatedAt).fromNow()}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onNodeOpen?.(node.uid);
                            }}
                            className="flex items-center gap-1.5 text-[10px]! text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <ExternalLink size={12} />
                            Open Chat
                        </button>
                    </div>}
                    {/* {isExpanded(node.uid) && <div className="flex items-center justify-end w-full px-1.5 mb-1">
                        <div className="flex justify-between items-center py-1 px-2 mx-2 gap-1 rounded-md cursor-pointer! hover:bg-[#333]">
                            <div className="flex items-center text-[11.5px] text-[#999] capitalize">Business Agent</div>
                            <ChevronDown className="size-3" />
                        </div>
                    </div>} */}

                    <div className='workadd hidden absolute right-[-30px] pl-[15px]'>
                        {/* (!node.blockId?.metadata.isConditional || node.metadata?.isConditionalConstant) &&  */}
                        <div className='flex justify-center items-center size-[22px] bg-[#454545] rounded-full border border-[#777] cursor-pointer' onClick={(e) => {
                            e.stopPropagation();
                            if (showTool === node.uid) {
                                setShowTool(null);
                                return;
                            }

                            setShowTool(node.uid)
                        }}>
                            <Plus size={14} />
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
                    // Skip rendering connection if the target node doesn't exist
                    const targetNodeExists = nodes.some(n => n.id === toId);
                    if (!targetNodeExists) return null;

                    const toRef = refs.current[toId] || createRef();
                    refs.current[toId] = toRef;

                    return <Connector key={`${node.id}-${toId}`} containerRef={containerRef} fromRef={blockRef} toRef={toRef} bend={100} color="#646464" />
                })}
            </div>
        })}

        <AnimatePresence>
            {activeProcessing === "branching" && <motion.div className="fixed top-0 right-0 m-3 flex items-center justify-center gap-2 bg-[#eee] text-[12px] text-[#333] rounded-lg px-4 py-2.5 z-[100] shadow-lg">
                <div className="spinner border-t-[#333]!" />
                <span>Branching thought...</span>
            </motion.div>}
            {activeProcessing === "deleting" && <motion.div className="fixed top-0 right-0 m-3 flex items-center justify-center gap-2 text-[12px] bg-[#ff5959] text-white rounded-lg px-4 py-2.5 z-[100] shadow-lg">
                <div className="spinner border-t-white!" />
                <span>Deleting thought...</span>
            </motion.div>}

            {showUpgradeModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]"
                    onClick={() => setShowUpgradeModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-[#222] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                <Crown className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-100">Upgrade to Pro</h3>
                                <p className="text-[12px] text-gray-400">Unlock unlimited branching</p>
                            </div>
                        </div>
                        <p className="text-gray-400 text-[13px] mb-6">
                            You&apos;ve reached the limit of 5 thought branches per chat on the free plan.
                            Upgrade to Pro to create unlimited branches and explore more ideas.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Maybe Later
                            </button>
                            <a
                                href="/pricing"
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all text-center"
                            >
                                Upgrade Now
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div >
}

export default ChatCanvas;