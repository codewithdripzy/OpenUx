import { Request, Response } from "express";
import { HTTP_RESPONSE_CODE } from "../core/constants/values";
import authService, { AuthServiceError } from "../services/auth.service";

const FirebaseAuthController = async (req: Request, res: Response) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(HTTP_RESPONSE_CODE.BAD_REQUEST).json({ message: "ID Token is required" });
        }

        const authRes = await authService.loginWithFirebase(idToken);

        res.cookie("accessToken", authRes.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(HTTP_RESPONSE_CODE.OK).json({
            message: `Welcome, ${authRes.user.name}`,
            ...authRes
        });
    } catch (error) {
        if (error instanceof AuthServiceError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error("Firebase Auth Error:", error);
        return res.status(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR).json({ message: "Authentication failed" });
    }
};

const SessionValidateController = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(HTTP_RESPONSE_CODE.UNAUTHORIZED).json({ message: "Session is not valid" });
    }

    return res.status(HTTP_RESPONSE_CODE.OK).json({
        message: "Session is valid",
        user: req.user,
    });
};

const LogoutController = async (req: Request, res: Response) => {
    res.clearCookie("accessToken");
    return res.status(HTTP_RESPONSE_CODE.OK).json({ message: "Logged out successfully" });
};

export {
    FirebaseAuthController,
    SessionValidateController,
    LogoutController
};
