import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// For the Server, we MUST use firebase-admin to verify ID tokens.
if (!admin.apps.length) {
    let serviceAccount = null;

    // 1. Try from Environment Variable (for production or explicit path)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
            const envVal = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();
            if (envVal.startsWith('{')) {
                serviceAccount = JSON.parse(envVal);
            } else {
                const filePath = path.resolve(process.cwd(), envVal);
                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    serviceAccount = JSON.parse(fileContent);
                } else {
                    console.warn(`Firebase service account file not found at: ${filePath}`);
                }
            }
        } catch (e) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", e);
        }
    } 
    
    // 2. Try from local file (for development)
    if (!serviceAccount) {
        const filePath = path.join(process.cwd(), 'openux-ai-firebase.json');
        if (fs.existsSync(filePath)) {
            try {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                serviceAccount = JSON.parse(fileContent);
            } catch (e) {
                console.error("Failed to read/parse openux-ai-firebase.json:", e);
            }
        }
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin initialized successfully.");
    } else {
        console.warn("No Firebase service account found. verifyIdToken will fail.");
        admin.initializeApp();
    }
}

export const firebaseAuth = admin.auth();