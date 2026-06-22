import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCtLBMffb7keSa_AEQA-ZznLnbc00fVpbc",
  authDomain: "portoalize-bc7e1.firebaseapp.com",
  projectId: "portoalize-bc7e1",
  storageBucket: "portoalize-bc7e1.firebasestorage.app",
  messagingSenderId: "993288450534",
  appId: "1:993288450534:web:7b12a6de7d790734efe627",
  measurementId: "G-E7BWVGRWB9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);