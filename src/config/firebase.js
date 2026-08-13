// src/config/firebase.js
// Firebase 초기화 및 Firestore 연동
// 실제 배포 시 아래 firebaseConfig 값을 Firebase Console에서 발급받은 값으로 교체하세요.

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- Firestore CRUD helpers ---

export async function fetchProblems() {
  try {
    const snapshot = await getDocs(collection(db, 'problems'));
    if (snapshot.empty) return null;
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('Firebase fetch failed, falling back to local data.', e);
    return null;
  }
}

export async function saveProblem(problem) {
  const ref = doc(db, 'problems', problem.id);
  await setDoc(ref, problem, { merge: true });
}

export async function deleteProblemFromDB(problemId) {
  await deleteDoc(doc(db, 'problems', problemId));
}

export async function addProblemToDB(problem) {
  const ref = await addDoc(collection(db, 'problems'), problem);
  return ref.id;
}

export async function updateProblemInDB(problemId, data) {
  await updateDoc(doc(db, 'problems', problemId), data);
}
