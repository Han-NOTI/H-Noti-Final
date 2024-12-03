import App from './src/App';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAtbItawYDII4FhkNRVX90PGYs5OyG2nw",
  authDomain: "hannoti-50b2b.firebaseapp.com",
  projectId: "hannoti-50b2b",
  storageBucket: "hannoti-50b2b.firebasestorage.app",
  messagingSenderId: "563915267715",
  appId: "1:563915267715:web:93dc752cb86d7cab4a05b6",
  measurementId: "G-7CSDGXXJY9"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default App;
