import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js';
import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth-compat.js';
import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore-compat.js';
import 'https://www.gstatic.com/firebasejs/10.11.0/firebase-storage-compat.js';

const firebaseConfig = {
  apiKey: "AIzaSyCPeNzz7biYqtWg68NznozglVUKA18Y7s4",
  authDomain: "trilha-educacional-5e1cb.firebaseapp.com",
  projectId: "trilha-educacional-5e1cb",
  storageBucket: "trilha-educacional-5e1cb.appspot.com",
  messagingSenderId: "211685584933",
  appId: "1:211685584933:web:3b3410749edef661d50fcc"
};


firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();


export { auth, db };
