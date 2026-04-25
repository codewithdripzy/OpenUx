import { Request, Response } from "express";
import { AIService } from "../services/ai.service";
import { ProjectService } from "../services/project.service";
import { z } from "zod";

const nodeSchema = z.object({
    nodes: z.array(z.object({
        id: z.string(),
        pageSlug: z.string(),
        pageName: z.string(),
        prompt: z.string(),
        rules: z.array(z.string()),
        actions: z.array(z.string()),
        endGoal: z.string(),
        connections: z.array(z.string()).describe("IDs of nodes this node connects to")
    }))
});

export const CreateProjectController = async (req: Request, res: Response) => {
    try {
        const project = await ProjectService.createProject(req.body);
        return res.status(201).json(project);
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
};

export const GetProjectController = async (req: Request, res: Response) => {
    try {
        const project = await ProjectService.getProjectById(req.params.projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });
        return res.json(project);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const ListProjectsController = async (req: Request, res: Response) => {
    try {
        const projects = await ProjectService.listProjects();
        return res.json(projects);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const UpdateProjectController = async (req: Request, res: Response) => {
    try {
        const project = await ProjectService.updateProject(req.params.projectId, req.body);
        if (!project) return res.status(404).json({ message: "Project not found" });
        return res.json(project);
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
};

export const DeleteProjectController = async (req: Request, res: Response) => {
    try {
        const project = await ProjectService.deleteProject(req.params.projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });
        return res.status(204).send();
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const GenerateProjectAIController = async (req: Request, res: Response) => {
    try {
        const { prompt, provider, modelId, projectId } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: "Prompt is required" });
        }

        let context = "";
        let existingProject = null;

        if (projectId) {
            existingProject = await ProjectService.getProjectById(projectId);
            if (existingProject) {
                context = `
Existing Project Context:
Current Nodes: ${JSON.stringify(existingProject.nodes, null, 2)}
Initial Prompt: ${existingProject.prompt}
`;
            }
        }

        const systemPrompt = `
You are an expert UX Architect and Product Designer. Your task is to design a structured application workflow based on a user's description.
${context}

User Prompt: "${prompt}"

Generate a list of interconnected nodes. Each node represents a specific view or step in the user experience.
For each node, define:
- id: A unique identifier (e.g., "node-1")
- pageSlug: A URL-friendly slug (e.g., "/login", "/dashboard/settings")
- pageName: A human-readable name (e.g., "User Login", "Settings Dashboard")
- prompt: A concise AI prompt describing the UI and logic for this specific page.
- rules: A list of business rules or constraints for this page.
- actions: Possible user actions or transitions from this page.
- endGoal: What the user should achieve on this page.
- connections: A list of node IDs that this node flows into.

Ensure the workflow is logical, complete, and solves the user's problem.
If existing context is provided, evolve or modify the workflow according to the new prompt while maintaining consistency where appropriate.
`;

        const { nodes: generatedNodes } = await AIService.generateStructured(systemPrompt, nodeSchema, provider, modelId);

        // Assign positions and uids
        const nodes = generatedNodes.map((node: any, index: number) => ({
            ...node,
            uid: node.id,
            position: {
                x: 100 + (index % 3) * 450,
                y: 100 + Math.floor(index / 3) * 400
            },
            updatedAt: new Date()
        }));

        // If we have a projectId, update it. Otherwise, create a new one.
        if (existingProject) {
            const updated = await ProjectService.updateProject(projectId, {
                nodes,
            });
            return res.json({ project: updated });
        } else {
            const project = await ProjectService.createProject({
                name: "New AI Generated Project",
                prompt,
                model: modelId,
                nodes,
                owner: req.user?.id
            });
            return res.json({ project });
        }

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return res.status(500).json({ message: error.message });
    }
};
