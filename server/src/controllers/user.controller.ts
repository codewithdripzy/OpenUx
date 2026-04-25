import { Request, Response } from "express";
import { HTTP_RESPONSE_CODE } from "../core/constants/values";
import UserModel from "../models/user.model";

const GetAuthenticatedUserController = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(HTTP_RESPONSE_CODE.UNAUTHORIZED).json({ message: "Your session has expired, login to continue" });
        }

        return res.status(HTTP_RESPONSE_CODE.OK).json({
            message: "User fetched successfully",
            user,
        });

    } catch (error) {
        console.error("Error getting authenticated user:", error);
        return res.status(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR).json({ message: "Unable to fetch user profile" });
    }
};

const ListUsersController = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== "superadmin") {
            return res.status(HTTP_RESPONSE_CODE.FORBIDDEN).json({ message: "Unauthorized" });
        }
        const users = await UserModel.find().sort({ createdAt: -1 });
        return res.status(HTTP_RESPONSE_CODE.OK).json(users);
    } catch (error) {
        return res.status(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR).json({ message: "Unable to list users" });
    }
};

const UpdateUserRoleController = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== "superadmin") {
            return res.status(HTTP_RESPONSE_CODE.FORBIDDEN).json({ message: "Unauthorized" });
        }
        const { role } = req.body;
        const user = await UserModel.findByIdAndUpdate(req.params.id, { role }, { new: true });
        return res.status(HTTP_RESPONSE_CODE.OK).json(user);
    } catch (error) {
        return res.status(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR).json({ message: "Unable to update user" });
    }
};

const DeleteUserController = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== "superadmin") {
            return res.status(HTTP_RESPONSE_CODE.FORBIDDEN).json({ message: "Unauthorized" });
        }
        await UserModel.findByIdAndDelete(req.params.id);
        return res.status(HTTP_RESPONSE_CODE.OK).json({ message: "User deleted" });
    } catch (error) {
        return res.status(HTTP_RESPONSE_CODE.INTERNAL_SERVER_ERROR).json({ message: "Unable to delete user" });
    }
};

export { 
    GetAuthenticatedUserController,
    ListUsersController,
    UpdateUserRoleController,
    DeleteUserController
};