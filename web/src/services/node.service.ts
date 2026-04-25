import { ChatData } from "@/core/interfaces/data";

class NodeService {
    async branchNode(chatId: string, nodeId: string): Promise<{ success: boolean; message: string; data: ChatData }> {
        return { success: true, message: "Success", data: {} as ChatData };
    }

    async deleteNode(chatId: string, nodeId: string): Promise<{ success: boolean; message: string; data: ChatData }> {
        return { success: true, message: "Success", data: {} as ChatData };
    }
}

export default new NodeService();
