import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBgrMNJDCvvclITujNpOwiKHhXoBkZ2118",
  authDomain: "anikutusu-7896d.firebaseapp.com",
  projectId: "anikutusu-7896d",
  storageBucket: "anikutusu-7896d.firebasestorage.app",
  messagingSenderId: "90032159684",
  appId: "1:90032159684:web:1b4231cc8db879fc9b0291",
  measurementId: "G-NH3933GDG4"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export default app; 