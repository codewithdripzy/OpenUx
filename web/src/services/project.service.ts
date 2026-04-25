import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api/v1";

class ProjectService {
    async generateAI(prompt: string, provider: string = "google", modelId: string = "gemini-2.5-flash", projectId?: string) {
        try {
            const response = await axios.post(`${API_URL}/projects/generate`, {
                prompt,
                provider,
                modelId,
                projectId
            }, { withCredentials: true });
            return response.data;
        } catch (error) {
            console.error("Error generating AI project:", error);
            throw error;
        }
    }

    async createProject(data: any) {
        return axios.post(`${API_URL}/projects`, data, { withCredentials: true });
    }

    async getProject(id: string) {
        return axios.get(`${API_URL}/projects/${id}`, { withCredentials: true });
    }
}

export const projectService = new ProjectService();
