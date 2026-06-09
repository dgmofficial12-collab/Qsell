import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0tAv9GDU9hMgcxXj2xlh0JSc6DeSurGw",
  authDomain: "qsell-f7a6a.firebaseapp.com",
  projectId: "qsell-f7a6a",
  storageBucket: "qsell-f7a6a.firebasestorage.app",
  messagingSenderId: "351505661677",
  appId: "1:351505661677:web:66b4c95e1337267f5a16e4",
  measurementId: "G-Y17EQ7J5ZE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { serverTimestamp };