import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCIqOfZuP1ZpfoY2oXHvvmKpsFUaKtO8rs",
  authDomain: "diceshub.firebaseapp.com",
  projectId: "diceshub",
  storageBucket: "diceshub.firebasestorage.app",
  messagingSenderId: "499666493429",
  appId: "1:499666493429:web:4a5d30227c091b29040abc",
  measurementId: "G-4PCW0TPWSQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();