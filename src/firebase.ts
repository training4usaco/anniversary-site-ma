import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCmwGw-A4QG2Z4tMPEmdXOizM_wzp1cw-c",
    authDomain: "anniversary-site-ma.firebaseapp.com",
    projectId: "anniversary-site-ma",
    storageBucket: "anniversary-site-ma.firebasestorage.app",
    messagingSenderId: "1038830184829",
    appId: "1:1038830184829:web:9be098c5d2f51aa2efc414",
    measurementId: "G-YWH1HGGYVC"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);