import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCcT3AWiRp93FzFArbt1MK1EKmlQbTsHnM",
  authDomain: "portoalize-63c2d.firebaseapp.com",
  projectId: "portoalize-63c2d",
  storageBucket: "portoalize-63c2d.firebasestorage.app",
  messagingSenderId: "156163010837",
  appId: "1:156163010837:web:47b98efcf7a1b1e50df91c",
  measurementId: "G-RTKY6XZ00Z"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);