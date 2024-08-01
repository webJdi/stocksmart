// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCfKLlTtlWQGR1E-C9ZNWX8sKL7otmMbhc",
  authDomain: "voila-e2df3.firebaseapp.com",
  projectId: "voila-e2df3",
  storageBucket: "voila-e2df3.appspot.com",
  messagingSenderId: "486508317785",
  appId: "1:486508317785:web:d6aee28f5e7ec4251ff548",
  measurementId: "G-M8KZBCNVSS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
const analytics = getAnalytics(app);

export {app, firestore}