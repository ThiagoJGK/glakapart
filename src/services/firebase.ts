import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyC99EyHOJ3Zm_yvGgtayYOqWuk6R1idkzU",
    authDomain: "apart-glak.firebaseapp.com",
    projectId: "apart-glak",
    storageBucket: "apart-glak.firebasestorage.app",
    messagingSenderId: "692037327722",
    appId: "1:692037327722:web:0ca434bd502fbc20dee313",
    measurementId: "G-ZZB8DGRCZB"
};

// Initialize Firebase safely for Next.js SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// Analytics can only run on the client
export const getSafeAnalytics = async () => {
    if (typeof window !== "undefined") {
        const supported = await isSupported();
        if (supported) {
            return getAnalytics(app);
        }
    }
    return null;
};


