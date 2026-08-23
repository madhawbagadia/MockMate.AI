
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "mockmate-b8175.firebaseapp.com",
  projectId: "mockmate-b8175",
  storageBucket: "mockmate-b8175.firebasestorage.app",
  messagingSenderId: "548402154905",
  appId: "1:548402154905:web:5ddb72310d7e7c5343d708"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };