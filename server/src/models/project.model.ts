import { model, models } from "mongoose";
import projectSchema from "../schemas/project.schema";

const ProjectModel = models.Project || model("Project", projectSchema, "projects");

export default ProjectModel;
