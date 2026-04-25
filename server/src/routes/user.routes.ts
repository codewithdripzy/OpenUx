import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { 
    GetAuthenticatedUserController,
    ListUsersController,
    UpdateUserRoleController,
    DeleteUserController
} from "../controllers/user.controller";

const userRouter = Router();

userRouter.use(authMiddleware);

userRouter.route("/")
    .get(GetAuthenticatedUserController);

// Admin operations
userRouter.route("/all")
    .get(ListUsersController);

userRouter.route("/:id")
    .put(UpdateUserRoleController)
    .delete(DeleteUserController);

export default userRouter;
