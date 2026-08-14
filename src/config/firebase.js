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
  await setDoc(ref, { ...problem, adminKey: 'comedu2026' }, { merge: true });
}

export async function deleteProblemFromDB(problemId) {
  await deleteDoc(doc(db, 'problems', problemId));
}

export async function fetchQuizQuestions() {
  try {
    const snapshot = await getDocs(collection(db, 'quiz_questions'));
    if (snapshot.empty) return null;
    return snapshot.docs.map((d) => ({ id: Number(d.id) || d.id, ...d.data() }));
  } catch (e) {
    console.warn('Firebase fetch quiz failed, falling back to local data.', e);
    return null;
  }
}

export async function saveQuizQuestion(question) {
  const ref = doc(db, 'quiz_questions', String(question.id));
  await setDoc(ref, { ...question, adminKey: 'comedu2026' }, { merge: true });
}

export async function deleteQuizQuestionFromDB(questionId) {
  await deleteDoc(doc(db, 'quiz_questions', String(questionId)));
}

// --- Version Snapshot Helpers ---
export async function saveVersionSnapshot(type, data, note = '') {
  const versionId = `v_${Date.now()}`;
  const timestamp = new Date().toISOString();
  const dateStr = new Date().toLocaleString('ko-KR');
  const collectionName = type === 'quiz' ? 'quiz_versions' : 'problem_versions';
  
  const payload = {
    id: versionId,
    type,
    timestamp,
    dateStr,
    count: data.length,
    data,
    note,
    adminKey: 'comedu2026',
  };

  try {
    const ref = doc(db, collectionName, versionId);
    await setDoc(ref, payload);
  } catch (e) {
    console.warn('Firebase version save failed:', e);
  }

  // Also maintain in localStorage as immediate fallback
  try {
    const localKey = type === 'quiz' ? 'quiz_version_history' : 'problem_version_history';
    const localList = JSON.parse(localStorage.getItem(localKey) || '[]');
    localList.unshift(payload);
    // Keep last 30 versions in localStorage
    localStorage.setItem(localKey, JSON.stringify(localList.slice(0, 30)));
  } catch (e) {
    console.warn('Local version history write failed:', e);
  }

  return payload;
}

export async function fetchVersionSnapshots(type) {
  const collectionName = type === 'quiz' ? 'quiz_versions' : 'problem_versions';
  const localKey = type === 'quiz' ? 'quiz_version_history' : 'problem_version_history';
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    if (!snapshot.empty) {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      return list;
    }
  } catch (e) {
    console.warn('Firebase fetch versions failed, using local history.', e);
  }
  try {
    return JSON.parse(localStorage.getItem(localKey) || '[]');
  } catch {
    return [];
  }
}

export async function deleteVersionSnapshot(type, versionId) {
  const collectionName = type === 'quiz' ? 'quiz_versions' : 'problem_versions';
  const localKey = type === 'quiz' ? 'quiz_version_history' : 'problem_version_history';
  try {
    await deleteDoc(doc(db, collectionName, versionId));
  } catch (e) {
    console.warn('Firebase delete version failed:', e);
  }
  try {
    const localList = JSON.parse(localStorage.getItem(localKey) || '[]');
    const filtered = localList.filter((v) => v.id !== versionId);
    localStorage.setItem(localKey, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Local version delete failed:', e);
  }
}
