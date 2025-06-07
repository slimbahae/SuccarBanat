// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUv15mrZJjbBpTLW0nJFgF5zFoAaTuPXc",
  authDomain: "beautycenter-906ad.firebaseapp.com",
  projectId: "beautycenter-906ad",
  storageBucket: "beautycenter-906ad.firebasestorage.app",
  messagingSenderId: "702512577527",
  appId: "1:702512577527:web:6b4e7e44b7ad7e7edcccf2",
  measurementId: "G-MHFCHFVFZ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);