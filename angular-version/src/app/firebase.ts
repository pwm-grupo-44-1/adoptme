import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBojgRzOyReyBfG9-aZPvRNfQ_xaSPJQic",
  authDomain: "db-adoptme.firebaseapp.com",
  projectId: "db-adoptme",
  storageBucket: "db-adoptme.firebasestorage.app",
  messagingSenderId: "902803106114",
  appId: "1:902803106114:web:b1e3f60d42fa97543fc0db"
};

const app = initializeApp(firebaseConfig);

export const dbFirebase = getFirestore(app);
