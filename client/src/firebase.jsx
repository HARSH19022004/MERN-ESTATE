// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-bbb0b.firebaseapp.com",
  projectId: "mern-estate-bbb0b",
  storageBucket: "mern-estate-bbb0b.firebasestorage.app",
  messagingSenderId: "1071001313766",
  appId: "1:1071001313766:web:54c49f6e4bed85e588f627"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);