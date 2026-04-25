import { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    firebaseUid: { type: String, required: true, unique: true },
    photoURL: { type: String },
    role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    provider: { type: String, enum: ["google.com", "github.com", "twitter.com"], required: true },
  },
  { timestamps: true }
);

export default UserSchema;
