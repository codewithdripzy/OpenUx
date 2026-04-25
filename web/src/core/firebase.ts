import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// These keys were provided in the server config but belong on the client (web)
const firebaseConfig = {
  apiKey: "AIzaSyCxBkgSC7iC2jdcsGaK5K8lmawvbS305hQ",
  authDomain: "openux-ai.firebaseapp.com",
  projectId: "openux-ai",
  storageBucket: "openux-ai.firebasestorage.app",
  messagingSenderId: "200804432789",
  appId: "1:200804432789:web:5b4b2c99a3621c8dfa949c",
  measurementId: "G-V90V69KHLR"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Analytics only works in the browser
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const twitterProvider = new TwitterAuthProvider();
