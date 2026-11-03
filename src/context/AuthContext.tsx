import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  getAuthorizedDomainsConsoleUrl,
} from '../lib/firebase';

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
  unauthorizedDomainHost: string | null;
  authorizedDomainsConsoleUrl: string;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  clearSignInError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailPass: (email: string, pass: string) => Promise<void>;
  signUpWithEmailPass: (email: string, pass: string, displayName: string) => Promise<void>;
  signInAsGuest: (name?: string) => void;
  signOut: () => Promise<void>;
}

const GUEST_STORAGE_KEY = 'astrolabe_guest_profile';

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isSigningIn: false,
  signInError: null,
  unauthorizedDomainHost: null,
  authorizedDomainsConsoleUrl: '',
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  clearSignInError: () => {},
  signInWithGoogle: async () => {},
  signInWithEmailPass: async () => {},
  signUpWithEmailPass: async () => {},
  signInAsGuest: () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [unauthorizedDomainHost, setUnauthorizedDomainHost] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Astrolabe User',
          email: currentUser.email || null,
          photoURL: currentUser.photoURL || null,
          isAnonymous: currentUser.isAnonymous,
        });
        localStorage.removeItem(GUEST_STORAGE_KEY);
      } else {
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

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setSignInError(null);
    setUnauthorizedDomainHost(null);

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
        setIsAuthModalOpen(false);
      }
    } catch (err: any) {
      console.warn('Google Sign In caught:', err?.code, err?.message);
      const code = err?.code || '';

      if (code === 'auth/unauthorized-domain' || code === 'auth/operation-not-supported-in-this-environment') {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your-domain';
        setUnauthorizedDomainHost(currentHost);
        setSignInError(
          `ডোমেইন সেটিংস: "${currentHost}" ডোমেইনটি ফায়ারবেসের Authorized Domains তালিকায় যুক্ত করতে হবে। এছাড়া আপনি সরাসরি নিচে ইমেইল/পাসওয়ার্ড দিয়ে অথবা গেস্ট মোডে তাৎক্ষণিক লগইন করতে পারেন।`
        );
      } else if (code === 'auth/popup-blocked') {
        setSignInError(
          'আপনার ব্রাউজারে পপআপ ব্লক করা রয়েছে। অ্যাড্রেস বারের পপআপ আইকন থেকে Allow করুন অথবা নিচে ইমেইল/গেস্ট প্রোফাইলে লগইন করুন।'
        );
      } else if (code === 'auth/popup-closed-by-user') {
        setSignInError('লগইন পপআপ উইন্ডো বন্ধ করা হয়েছে।');
      } else {
        setSignInError(err?.message || 'গুগল লগইন সম্পন্ন করা যায়নি। অনুগ্রহ করে ইমেইল দিয়ে লগইন করুন।');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailSignIn = async (email: string, pass: string) => {
    setIsSigningIn(true);
    setSignInError(null);
    try {
      const fbUser = await loginWithEmail(email, pass);
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || null,
          photoURL: fbUser.photoURL || null,
          isAnonymous: false,
        });
        setIsAuthModalOpen(false);
      }
    } catch (err: any) {
      console.error('Email sign in error:', err);
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setSignInError('ইমেইল বা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে পুনরায় যাচাই করুন।');
      } else if (code === 'auth/invalid-email') {
        setSignInError('সঠিক ইমেইল অ্যাড্রেস লিখুন।');
      } else {
        setSignInError(err?.message || 'ইমেইল সাইন-ইন সম্পন্ন করা যায়নি।');
      }
      throw err;
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailSignUp = async (email: string, pass: string, displayName: string) => {
    setIsSigningIn(true);
    setSignInError(null);
    try {
      const fbUser = await registerWithEmail(email, pass, displayName);
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          displayName: displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || null,
          photoURL: null,
          isAnonymous: false,
        });
        setIsAuthModalOpen(false);
      }
    } catch (err: any) {
      console.error('Email sign up error:', err);
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setSignInError('এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে। "সাইন ইন" অপশনটি ব্যবহার করুন।');
      } else if (code === 'auth/weak-password') {
        setSignInError('পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।');
      } else {
        setSignInError(err?.message || 'অ্যাকাউন্ট তৈরি করা যায়নি।');
      }
      throw err;
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
    setUnauthorizedDomainHost(null);
    setIsAuthModalOpen(false);
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
    setUnauthorizedDomainHost(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSigningIn,
        signInError,
        unauthorizedDomainHost,
        authorizedDomainsConsoleUrl: getAuthorizedDomainsConsoleUrl(),
        isAuthModalOpen,
        openAuthModal: () => {
          setSignInError(null);
          setIsAuthModalOpen(true);
        },
        closeAuthModal: () => setIsAuthModalOpen(false),
        clearSignInError,
        signInWithGoogle: handleGoogleSignIn,
        signInWithEmailPass: handleEmailSignIn,
        signUpWithEmailPass: handleEmailSignUp,
        signInAsGuest,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
