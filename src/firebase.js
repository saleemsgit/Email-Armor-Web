// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {

  apiKey: "AIzaSyADklyKn4dZI8uEC6QkSbQ5VWnYSLYGxB8",
  authDomain: "email-armor.firebaseapp.com",
  projectId: "email-armor",
  storageBucket: "email-armor.appspot.com",
  messagingSenderId: "192538283914",
  appId: "1:192538283914:web:5ff23e91f5ed22901f0273",
  measurementId: "G-5S09M00473"

};



const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
export {db, auth, storage};