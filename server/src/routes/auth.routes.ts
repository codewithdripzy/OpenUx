import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import {
	FirebaseAuthController,
	LogoutController,
	SessionValidateController,
} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.route("/firebase").post(FirebaseAuthController);
authRouter.route("/logout").post(LogoutController);
authRouter.route("/session").get(authMiddleware, SessionValidateController);

export default authRouter;
