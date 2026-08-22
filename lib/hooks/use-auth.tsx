"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserDocument,
  getUserProfile,
} from "@/lib/firebase";
import { User, Profile } from "@/types";
import { User as FirebaseUser } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  signInGoogle: () => Promise<void>;
  signInWithCredentials: (email: string, pass: string) => Promise<void>;
  signUpWithCredentials: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  profile: null,
  loading: true,
  signInGoogle: async () => {},
  signInWithCredentials: async () => {},
  signUpWithCredentials: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (uid: string) => {
    try {
      const p = await getUserProfile(uid);
      if (p) {
        setProfile(p as unknown as Profile);
      } else {
        setProfile(null);
      }
    } catch (e) {
      console.warn("Could not fetch profile:", e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const u: User = {
          id: fbUser.uid,
          email: fbUser.email || "",
          displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Learner",
          photoURL: fbUser.photoURL || undefined,
          createdAt: new Date(),
        };
        setUser(u);
        try {
          await createUserDocument(fbUser);
          await fetchUserProfile(fbUser.uid);
        } catch (e) {
          console.warn("Firebase doc setup note:", e);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  const signInWithCredentials = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmail(email, pass);
    } finally {
      setLoading(false);
    }
  };

  const signUpWithCredentials = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      await signUpWithEmail(email, pass, name);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut();
      setUser(null);
      setProfile(null);
      setFirebaseUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (firebaseUser?.uid) {
      await fetchUserProfile(firebaseUser.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        profile,
        loading,
        signInGoogle,
        signInWithCredentials,
        signUpWithCredentials,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
