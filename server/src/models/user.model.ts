import { model, models } from "mongoose";
import UserSchema from "../schemas/user.schema";

const UserModel = models.User || model("User", UserSchema, "users");

export default UserModel;
