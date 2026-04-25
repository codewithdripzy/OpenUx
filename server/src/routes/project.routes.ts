import { Router } from "express";
import {
    CreateProjectController,
    GetProjectController,
    ListProjectsController,
    UpdateProjectController,
    DeleteProjectController,
    GenerateProjectAIController
} from "../controllers/project.controller";
import { validateSchema } from "../utils/validator";
import authMiddleware from "../middlewares/auth.middleware";
import { createProjectDto, updateProjectDto } from "../validators/project.dto";

const projectRouter = Router();

projectRouter.route("/")
    .get(ListProjectsController)
    .post(authMiddleware, validateSchema(createProjectDto), CreateProjectController);

projectRouter.route("/generate")
    .post(authMiddleware, GenerateProjectAIController);

projectRouter.route("/:projectId")
    .get(GetProjectController)
    .patch(authMiddleware, validateSchema(updateProjectDto), UpdateProjectController)
    .delete(authMiddleware, DeleteProjectController);

export default projectRouter;
