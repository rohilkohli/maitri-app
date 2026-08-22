"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// Firebase Configuration with safe fallbacks for static prerendering
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDemoFallbackKeyForBuildSafety00",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "maitri-demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "maitri-demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "maitri-demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Auth functions
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  return result.user;
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export function onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return firebaseOnAuthStateChanged(auth, callback);
}

// Firestore helpers
export function toDate(timestamp: Timestamp | Date | null | undefined): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return null;
}

// User functions
export async function createUserDocument(user: FirebaseUser) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
    });
  }
  return userRef;
}

export async function getUserProfile(userId: string) {
  const profileRef = doc(db, "profiles", userId);
  const snap = await getDoc(profileRef);
  if (!snap.exists()) return null;
  return { ...snap.data(), userId } as DocumentData;
}

export async function saveProfile(userId: string, data: Record<string, unknown>) {
  const profileRef = doc(db, "profiles", userId);
  await setDoc(profileRef, { ...data, userId, updatedAt: serverTimestamp() }, { merge: true });
}

// Course functions
export async function saveCourse(courseId: string, data: Record<string, unknown>) {
  const courseRef = doc(db, "courses", courseId);
  await setDoc(courseRef, { ...data, createdAt: serverTimestamp() }, { merge: true });
}

export async function getUserCourses(userId: string) {
  const q = query(
    collection(db, "courses"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCourse(courseId: string) {
  const ref = doc(db, "courses", courseId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Learner Topic State functions
export async function saveLearnerTopicState(
  userId: string,
  topicId: string,
  data: Record<string, unknown>
) {
  const id = `${userId}_${topicId}`;
  const ref = doc(db, "learnerTopicStates", id);
  await setDoc(ref, { ...data, userId, topicId, id }, { merge: true });
}

export async function getLearnerTopicStates(userId: string) {
  const q = query(
    collection(db, "learnerTopicStates"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeLearnerTopicStates(
  userId: string,
  callback: (states: DocumentData[]) => void
) {
  const q = query(
    collection(db, "learnerTopicStates"),
    where("userId", "==", userId)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// Attempt functions
export async function saveAttempt(attemptId: string, data: Record<string, unknown>) {
  const ref = doc(db, "attempts", attemptId);
  await setDoc(ref, { ...data, createdAt: serverTimestamp() });
}

export async function getRecentAttempts(userId: string, count: number = 5) {
  const q = query(
    collection(db, "attempts"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Flashcard functions
export async function saveFlashcard(flashcardId: string, data: Record<string, unknown>) {
  const ref = doc(db, "flashcards", flashcardId);
  await setDoc(ref, data, { merge: true });
}

export async function getDueFlashcards(userId: string) {
  const now = new Date();
  const q = query(
    collection(db, "flashcards"),
    where("userId", "==", userId),
    where("nextReviewAt", "<=", Timestamp.fromDate(now))
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getUserFlashcards(userId: string) {
  const q = query(
    collection(db, "flashcards"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Storage functions
export async function uploadSyllabus(userId: string, file: File) {
  const storageRef = ref(storage, `syllabi/${userId}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
}

// Delete functions
export async function deleteUserData(userId: string) {
  // Delete profile
  await deleteDoc(doc(db, "profiles", userId));

  // Delete user doc
  await deleteDoc(doc(db, "users", userId));

  // Delete courses
  const courses = await getUserCourses(userId);
  for (const course of courses) {
    await deleteDoc(doc(db, "courses", course.id));
  }

  // Delete topic states
  const states = await getLearnerTopicStates(userId);
  for (const state of states) {
    await deleteDoc(doc(db, "learnerTopicStates", state.id as string));
  }
}

export { auth, db, storage, app };
