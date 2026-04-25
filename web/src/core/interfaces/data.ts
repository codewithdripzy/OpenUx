export interface NodeData {
    id: string;
    uid: string;
    title?: string;
    pageName?: string;
    pageSlug?: string;
    prompt?: string;
    rules?: string[];
    actions?: string[];
    endGoal?: string;
    context?: string;
    position: { x: number; y: number };
    parents?: NodeRef[];
    connections: NodeRef[];
    messages?: MessageData[];
    updatedAt: string | Date;
    metadata?: {
        isStart?: boolean;
        [key: string]: any;
    };
}

export type NodeRef = string | { id: string };

export interface MessageData {
    id?: string;
    uid?: string;
    sender: "user" | "agent";
    content: string;
    timestamp?: string | Date;
}

export interface AgentData {
    uid: string;
    name: string;
    tag?: string;
    description?: string;
    icon?: string;
}

export interface ChatData {
    uid: string;
    title: string;
    nodes: NodeData[];
}

export interface NodeThinkingData {
    nodeId: string;
    message: string;
}

export interface PromptData {
    tools: {
        deepReasoning: boolean;
        search: boolean;
    };
}
