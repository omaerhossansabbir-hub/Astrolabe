import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isSigningIn: boolean;
  signInError: string | null;
  clearSignInError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: (name?: string) => void;
  signOut: () => Promise<void>;
}

const GUEST_STORAGE_KEY = 'astrolabe_guest_profile';

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isSigningIn: false,
  signInError: null,
  clearSignInError: () => {},
  signInWithGoogle: async () => {},
  signInAsGuest: () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check if user already has an active guest profile saved
    const savedGuest = localStorage.getItem(GUEST_STORAGE_KEY);
    if (savedGuest) {
      try {
        const parsed = JSON.parse(savedGuest);
        if (parsed?.uid) {
          setUser(parsed);
        }
      } catch (e) {
        console.warn('Failed to parse saved guest profile', e);
      }
    }

    // 2. Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Firebase user takes precedence
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'Google User',
          email: currentUser.email || null,
          photoURL: currentUser.photoURL || null,
          isAnonymous: currentUser.isAnonymous,
        });
        localStorage.removeItem(GUEST_STORAGE_KEY);
      } else {
        // If not firebase user, keep guest if set
        const activeGuest = localStorage.getItem(GUEST_STORAGE_KEY);
        if (activeGuest) {
          try {
            setUser(JSON.parse(activeGuest));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setSignInError(null);

    try {
      const googleUser = await loginWithGoogle();
      if (googleUser) {
        setUser({
          uid: googleUser.uid,
          displayName: googleUser.displayName || 'Google User',
          email: googleUser.email || null,
          photoURL: googleUser.photoURL || null,
          isAnonymous: false,
        });
      }
    } catch (err: any) {
      console.warn('Google Sign In caught:', err?.code, err?.message);
      const code = err?.code || '';

      if (code === 'auth/popup-blocked') {
        setSignInError(
          'আপনার ব্রাউজারে পপআপ ব্লক রয়েছে। অ্যাড্রেস বারের পপআপ আইকনে ক্লিক করে "Allow" করুন, অথবা নিচের "গেস্ট প্রোফাইলে চালিয়ে যান" বাটনে ক্লিক করুন।'
        );
      } else if (code === 'auth/unauthorized-domain' || code === 'auth/operation-not-supported-in-this-environment') {
        // Automatically switch to guest profile so user is not stuck
        signInAsGuest('অ্যাস্ট্রো ইউজার');
        setSignInError(
          'ডোমেইন সেটিংসের কারণে সরাসরি গুগল লগইন সীমাবদ্ধ। আপনার জন্য নিরবচ্ছিন্ন ব্যবহারের সুবিধার্থে তাৎক্ষণিক প্রোফাইল তৈরি করা হয়েছে।'
        );
      } else if (code === 'auth/popup-closed-by-user') {
        setSignInError('লগইন পপআপ উইন্ডো বন্ধ করা হয়েছে। আবার চেষ্টা করতে পারেন বা গেস্ট মোড বেছে নিতে পারেন।');
      } else {
        setSignInError('গুগল লগইন সম্পন্ন করা যায়নি। আপনি সরাসরি অ্যাকাউন্ট ছাড়াই অ্যাস্ট্রো ল্যাব ব্যবহার করতে পারেন।');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInAsGuest = (name = 'Astrolabe Member') => {
    let guestId = '';
    const existing = localStorage.getItem(GUEST_STORAGE_KEY);
    if (existing) {
      try {
        guestId = JSON.parse(existing)?.uid || '';
      } catch {}
    }
    if (!guestId) {
      guestId = `guest_${Math.random().toString(36).substring(2, 10)}`;
    }

    const guestProfile: UserProfile = {
      uid: guestId,
      displayName: name,
      email: null,
      photoURL: null,
      isAnonymous: true,
    };

    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestProfile));
    setUser(guestProfile);
    setSignInError(null);
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      setUser(null);
      await logoutUser();
    } catch (err) {
      console.error('Sign out failed:', err);
      setUser(null);
    }
  };

  const clearSignInError = () => {
    setSignInError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSigningIn,
        signInError,
        clearSignInError,
        signInWithGoogle: handleSignIn,
        signInAsGuest,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
