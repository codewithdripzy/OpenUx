import ProjectModel from "../models/project.model";
import { v4 as uuidv4 } from "uuid";

export class ProjectService {
    static async createProject(data: any) {
        const project = new ProjectModel({
            uid: `proj_${uuidv4()}`,
            ...data
        });
        return await project.save();
    }

    static async getProjectById(projectId: string) {
        return await ProjectModel.findOne({ 
            $or: [{ _id: projectId }, { uid: projectId }] 
        }).populate("owner", "name email");
    }

    static async listProjects(filters: any = {}) {
        return await ProjectModel.find(filters).sort({ createdAt: -1 });
    }

    static async updateProject(projectId: string, data: any) {
        return await ProjectModel.findOneAndUpdate(
            { $or: [{ _id: projectId }, { uid: projectId }] },
            { $set: data },
            { new: true }
        );
    }

    static async deleteProject(projectId: string) {
        return await ProjectModel.findOneAndDelete({ 
            $or: [{ _id: projectId }, { uid: projectId }] 
        });
    }
}
