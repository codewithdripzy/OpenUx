import { AgentData } from "@/core/interfaces/data";

class AgentService {
    async getAllAgents(): Promise<{ success: boolean; data: AgentData[] }> {
        return {
            success: true,
            data: [
                { uid: "gemini-2.5-pro", name: "Gemini 2.5 Pro", tag: "Thinking" },
                { uid: "gemini-2.5-flash", name: "Gemini 2.5 Flash", tag: "Fast" },
                { uid: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", tag: "Creative" },
                { uid: "claude-opus-4", name: "Claude Opus 4", tag: "Powerful" },
                { uid: "gpt-4o", name: "GPT-4o", tag: "Balanced" },
                { uid: "gpt-4o-mini", name: "GPT-4o Mini", tag: "Efficient" }
            ]
        };
    }
}

export const agentService = new AgentService();
