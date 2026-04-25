"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { projectService } from "@/services/project.service";
import { agentService } from "@/services/agent.service";
import ChatCanvas from "@/components/ChatCanvas";
import MessageInput from "@/components/MessageInput";
import { MultiBranchView } from "@/components/MultiBranchView";
import LoadingOverlay from "@/components/LoadingOverlay";
import { NodeData, AgentData, ChatData, NodeThinkingData } from "@/core/interfaces/data";
import { useToast } from "@/hooks/use-toast";

function WorkspaceContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlPrompt = searchParams.get("prompt");
    const { toast } = useToast();

    // State
    const [isGenerating, setIsGenerating] = useState(false);
    const [project, setProject] = useState<ChatData | null>(null);
    const [agents, setAgents] = useState<AgentData[]>([]);
    const [activeNodes, setActiveNodes] = useState<string[]>([]);
    const [processingNodeIds, setProcessingNodeIds] = useState<string[]>([]);
    const [thinkingUpdatesByNode, setThinkingUpdatesByNode] = useState<Record<string, NodeThinkingData[]>>({});
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
    const [activeBranch, setActiveBranch] = useState<{ active: boolean; nodeId: string | null }>({ active: false, nodeId: null });
    const [message, setMessage] = useState("");
    const [selectedAgent, setSelectedAgent] = useState("gemini-2.5-flash");
    const [initialPromptProcessed, setInitialPromptProcessed] = useState(false);

    // Load agents
    useEffect(() => {
        agentService.getAllAgents().then(res => {
            if (res.success) setAgents(res.data);
        });
    }, []);

    const handleGenerate = async (promptText: string) => {
        setIsGenerating(true);
        setProcessingNodeIds(["initial"]);
        try {
            const data = await projectService.generateAI(promptText, "google", selectedAgent);
            setProject(data);
            if (data.nodes && data.nodes.length > 0) {
                setExpandedNodes({ [data.nodes[0].uid]: true });
                setActiveNodes([data.nodes[0].uid]);
            }
        } catch (error) {
            console.error("Error generating project:", error);
            toast.error("Generation failed", "Something went wrong while building your workspace. Please try again.");
            setMessage(promptText); // Put prompt back into message
        } finally {
            setIsGenerating(false);
            setProcessingNodeIds([]);
        }
    };

    useEffect(() => {
        if (initialPromptProcessed) return;

        let effectivePrompt = urlPrompt;
        if (!effectivePrompt && typeof window !== "undefined") {
            effectivePrompt = sessionStorage.getItem("pendingPrompt");
            if (effectivePrompt) {
                sessionStorage.removeItem("pendingPrompt");
            }
        }

        if (effectivePrompt && !project && !isGenerating) {
            setInitialPromptProcessed(true);
            handleGenerate(effectivePrompt);
        }
    }, [urlPrompt, project, isGenerating, initialPromptProcessed]);

    const updateChat = (updatedChat: ChatData) => {
        setProject(updatedChat);
    };

    const handleNodeOpen = (nodeId: string) => {
        setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
    };

    const onSendMessage = async (payload: { nodeIds: string[], prompt: string, tools?: any, attachments?: any }) => {
        if (!project || !payload.prompt.trim()) return;

        const originalMessage = payload.prompt;
        setIsGenerating(true);
        setProcessingNodeIds(payload.nodeIds);
        setMessage("");

        try {
            const data = await projectService.generateAI(payload.prompt, "google", selectedAgent, project.uid);
            setProject(data);
        } catch (error) {
            toast.error("Failed to send message", "Your request couldn't be processed. Please try again.");
            setMessage(originalMessage); // Restore on error
        } finally {
            setIsGenerating(false);
            setProcessingNodeIds([]);
        }
    };

    const onAgentChange = (agentId: string) => {
        setSelectedAgent(agentId);
    };

    const hasConnectedNodes = project?.nodes && project.nodes.length > 0;

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] text-white">
            <LoadingOverlay isVisible={isGenerating} />
            
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <div className="absolute left-0 top-0 w-full h-full overflow-auto">
                    <ChatCanvas
                        activeChat={project}
                        nodes={project?.nodes || []}
                        agents={agents}
                        activeNodes={activeNodes}
                        processingNodeIds={processingNodeIds}
                        thinkingUpdatesByNode={thinkingUpdatesByNode}
                        expandedNodes={expandedNodes}
                        onExpandedNodesChange={setExpandedNodes}
                        setActiveNodes={setActiveNodes}
                        updateChat={updateChat}
                        onMultiBranchOpen={(nodeId) => setActiveBranch({ active: true, nodeId })}
                        onNodeOpen={handleNodeOpen}
                    />
                </div>

                {/* Input Area */}
                {(activeNodes.length > 0 || !hasConnectedNodes) && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 z-50 w-full px-4 max-w-3xl">
                        <MessageInput
                            message={message}
                            isProcessing={isGenerating}
                            selectedAgent={selectedAgent}
                            setMessage={setMessage}
                            onAgentsLoad={setAgents}
                            onAgentChange={onAgentChange}
                            onSend={() => onSendMessage({ nodeIds: activeNodes, prompt: message })}
                        />
                    </div>
                )}
            </div>

            <MultiBranchView
                chatId={project?.uid || null}
                activeBranch={activeBranch}
                updateChat={updateChat}
                onClose={() => setActiveBranch({ active: false, nodeId: null })}
            />
        </div>
    );
}

export default function WorkspacePage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col h-screen bg-[#0a0a0a] text-white items-center justify-center">
                <div className="size-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        }>
            <WorkspaceContent />
        </Suspense>
    );
}
