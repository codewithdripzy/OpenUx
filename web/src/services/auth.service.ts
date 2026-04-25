import { auth, googleProvider, githubProvider, twitterProvider } from "@/core/firebase";
import { signInWithPopup, signOut as firebaseSignOut, UserCredential } from "firebase/auth";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api/v1";

class AuthService {
    async signInWithGoogle() {
        const result = await signInWithPopup(auth, googleProvider);
        return this.authenticateWithBackend(result);
    }

    async signInWithGithub() {
        const result = await signInWithPopup(auth, githubProvider);
        return this.authenticateWithBackend(result);
    }

    async signInWithX() {
        const result = await signInWithPopup(auth, twitterProvider);
        return this.authenticateWithBackend(result);
    }

    private async authenticateWithBackend(result: UserCredential) {
        const idToken = await result.user.getIdToken();
        const response = await axios.post(`${API_URL}/auth/firebase`, { idToken }, { withCredentials: true });
        return response.data;
    }

    async logout() {
        await firebaseSignOut(auth);
        await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
        window.location.href = "/";
    }

    async getSession() {
        try {
            const response = await axios.get(`${API_URL}/auth/session`, { withCredentials: true });
            return response.data;
        } catch (error) {
            return null;
        }
    }
}

export const authService = new AuthService();
