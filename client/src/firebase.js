// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "dream-homes-786.firebaseapp.com",
  projectId: "dream-homes-786",
  storageBucket: "dream-homes-786.firebasestorage.app",
  messagingSenderId: "460649290499",
  appId: "1:460649290499:web:b525257197c980c131e736"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);