import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC_QZp0HPYNlaYQoCxcwFnpIqYBpYx71dY",
  authDomain: "showroom-cars-65f24.firebaseapp.com",
  projectId: "showroom-cars-65f24",
  storageBucket: "showroom-cars-65f24.firebasestorage.app",
  messagingSenderId: "323020790965",
  appId: "1:323020790965:web:be2cb5ef8be3a5c27a72fc"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
