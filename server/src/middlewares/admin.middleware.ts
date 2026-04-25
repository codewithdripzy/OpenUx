import { Request, Response, NextFunction } from "express";
import { HTTP_RESPONSE_CODE } from "../core/constants/values";

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
        return res.status(HTTP_RESPONSE_CODE.UNAUTHORIZED).json({ message: "Authentication required" });
    }

    if (user.role !== "admin" && user.role !== "superadmin") {
        return res.status(HTTP_RESPONSE_CODE.FORBIDDEN).json({ message: "Access denied. Admin privileges required." });
    }

    next();
};

export default adminMiddleware;
