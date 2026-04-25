import { Request, Response, NextFunction } from "express";
import { HTTP_RESPONSE_CODE } from "../core/constants/values";
import authService from "../services/auth.service";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(HTTP_RESPONSE_CODE.UNAUTHORIZED).json({ message: "No token provided. Please login." });
        }

        const validation = await authService.verifyToken(token);

        if (!validation.valid || !validation.user) {
            return res.status(HTTP_RESPONSE_CODE.UNAUTHORIZED).json({ message: "Invalid or expired session." });
        }

        // Attach user to request
        (req as any).user = validation.user;
        
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
}

export default authMiddleware;