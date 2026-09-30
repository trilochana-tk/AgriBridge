import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXwOPzjenP8SHYFjLXKXIkEduNdIvuXLI",
  authDomain: "agribridge-bf38a.firebaseapp.com",
  projectId: "agribridge-bf38a",
  storageBucket: "agribridge-bf38a.firebasestorage.app",
  messagingSenderId: "1016386437495",
  appId: "1:1016386437495:web:9670d36cc76bf445a0e172"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);