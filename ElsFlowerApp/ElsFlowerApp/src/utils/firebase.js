// src/utils/firebase.js
// ⚠️  REMPLACE CES VALEURS par celles de ton projet Firebase
// Crée ton projet sur https://console.firebase.google.com
// puis Paramètres du projet > Ajouter une application Android

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAUHlsVW5dkL0gzGZGcmiLRE2Gq_VnB9Ok",
  authDomain: "el-s-flower.firebaseapp.com",
  projectId: "el-s-flower",
  storageBucket: "el-s-flower.firebasestorage.app",
  messagingSenderId: "492721624963",
  appId: "1:492721624963:web:c30ae6052b24e5ac3c08b6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
