// src/firebase/config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: For production, consider using environment variables
// instead of hardcoding these values.
const firebaseConfig = {
    apiKey: "AIzaSyCzCmdtgsshiS8UAlfPWscqPNrz2RSe9YQ",
    authDomain: "planogram-test-2.firebaseapp.com",
    projectId: "planogram-test-2",
    storageBucket: "planogram-test-2.firebasestorage.app",
    messagingSenderId: "1002167268311",
    appId: "1:1002167268311:web:769479581d9f8d90b85192",
    measurementId: "G-0M35ZL0F9C"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export the services for use in other parts of the application
export { auth, db };
