import jwt from "jsonwebtoken";
import UserModel from "../models/user.model";
import { firebaseAuth } from "../config/firebase";

const JWT_SECRET = process.env.JWT_SECRET || "openux_secret_key_2026";

export class AuthServiceError extends Error {
    constructor(public message: string, public statusCode: number = 500) {
        super(message);
        this.name = "AuthServiceError";
    }
}

class AuthService {
    /**
     * Login or Register with Firebase ID Token
     */
    async loginWithFirebase(idToken: string) {
        try {
            // Verify Firebase ID Token
            const decodedToken = await firebaseAuth.verifyIdToken(idToken);
            const { uid, email, name, picture, firebase } = decodedToken;

            if (!email) {
                throw new AuthServiceError("Email not provided by auth provider", 400);
            }

            // Find or Create User
            let user = await UserModel.findOne({ firebaseUid: uid });

            if (!user) {
                // If user doesn't exist by UID, check by email (to link accounts if needed)
                user = await UserModel.findOne({ email });

                if (user) {
                    // Update existing user with Firebase UID
                    user.firebaseUid = uid;
                    user.photoURL = picture || user.photoURL;
                    await user.save();
                } else {
                    // Create new user
                    user = await UserModel.create({
                        name: name || email.split('@')[0],
                        email: email.toLowerCase(),
                        firebaseUid: uid,
                        photoURL: picture,
                        provider: firebase.sign_in_provider,
                        role: (await UserModel.countDocuments()) === 0 ? "superadmin" : "user"
                    });
                }
            }

            if (user.status !== "active") {
                throw new AuthServiceError("Your account has been suspended", 403);
            }

            const accessToken = this.generateToken(user);

            return {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    photoURL: user.photoURL,
                    role: user.role
                },
                accessToken
            };
        } catch (error: any) {
            console.error("Firebase Login Error:", error);
            if (error instanceof AuthServiceError) throw error;
            throw new AuthServiceError(error.message || "Authentication failed", 401);
        }
    }

    async verifyToken(token: string) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            const user = await UserModel.findById(decoded.id);
            
            if (!user || user.status !== "active") {
                return { valid: false };
            }

            return {
                valid: true,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            };
        } catch (error) {
            return { valid: false };
        }
    }

    private generateToken(user: any) {
        return jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" } // Longer session for UX platform
        );
    }

    async validateAccessToken(token: string) {
        return this.verifyToken(token);
    }

    async logout() {
        return { message: "Logged out" };
    }
}

const authService = new AuthService();
export default authService;
