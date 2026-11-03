import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Mail,
  Lock,
  User,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AstrolabeLogo } from './AstrolabeLogo';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithGoogle,
    signInWithEmailPass,
    signUpWithEmailPass,
    signInAsGuest,
    isSigningIn,
    signInError,
    unauthorizedDomainHost,
    authorizedDomainsConsoleUrl,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [copiedHost, setCopiedHost] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleCopyHost = () => {
    if (unauthorizedDomainHost) {
      navigator.clipboard.writeText(unauthorizedDomainHost);
      setCopiedHost(true);
      setTimeout(() => setCopiedHost(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError('ইমেইল এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          setLocalError('আপনার নাম লিখুন।');
          return;
        }
        await signUpWithEmailPass(email.trim(), password.trim(), displayName.trim());
      } else {
        await signInWithEmailPass(email.trim(), password.trim());
      }
    } catch (err: any) {
      // Error handled by AuthContext
    }
  };

  const currentHost =
    unauthorizedDomainHost ||
    (typeof window !== 'undefined' ? window.location.hostname : 'your-domain.vercel.app');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0E0E11] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <AstrolabeLogo size={24} />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {mode === 'signin' ? 'সাইন ইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
            </h2>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Domain Notice Banner (shown when domain is not authorized in Firebase or on warning) */}
          {unauthorizedDomainHost && (
            <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
                <Globe className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0 mt-0.5" />
                <span>Vercel / কাস্টম ডোমেইন অথেন্টিকেশন গাইড</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                Google Sign-In কাজ করার জন্য আপনার বর্তমান ডোমেইনটি Firebase Console-এ যোগ করতে হবে:
              </p>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-[11px]">
                <span className="truncate text-zinc-800 dark:text-zinc-200">{currentHost}</span>
                <button
                  type="button"
                  onClick={handleCopyHost}
                  className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-sans cursor-pointer shrink-0 ml-2"
                >
                  {copiedHost ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHost ? 'কপি হয়েছে' : 'কপি'}</span>
                </button>
              </div>
              <div className="pt-1 flex items-center justify-between">
                <a
                  href={authorizedDomainsConsoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 underline hover:opacity-80"
                >
                  <span>Firebase Console Settings খুলুন</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[10px] text-zinc-400">Settings &gt; Authorized domains</span>
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                💡 টিপস: কোনো কনফিগারেশন ছাড়াই সরাসরি নিচে ইমেইল/পাসওয়ার্ড বা গেস্ট মোড দিয়ে এখনই ব্যবহার শুরু করতে পারেন!
              </div>
            </div>
          )}

          {/* Error Message */}
          {(signInError || localError) && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{localError || signInError}</div>
            </div>
          )}

          {/* Primary 1-Click Google Sign In */}
          <button
            onClick={() => signInWithGoogle()}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSigningIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-zinc-200 dark:border-zinc-800" />
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">অথবা</span>
            <div className="flex-1 h-px bg-zinc-200 dark:border-zinc-800" />
          </div>

          {/* Email Password Form (Works 100% on any domain without domain restrictions) */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  আপনার নাম
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Sabbir Hossain"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-950 dark:focus:border-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                ইমেইল ঠিকানা
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-950 dark:focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-950 dark:focus:border-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSigningIn ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : mode === 'signin' ? (
                'ইমেইল দিয়ে সাইন ইন করুন'
              ) : (
                'নতুন অ্যাকাউন্ট তৈরি করুন'
              )}
            </button>
          </form>

          {/* Toggle between Sign In and Sign Up */}
          <div className="text-center text-xs text-zinc-500 pt-1">
            {mode === 'signin' ? (
              <span>
                নতুন ব্যবহারকারী?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setLocalError(null);
                    setMode('signup');
                  }}
                  className="font-semibold text-zinc-900 dark:text-zinc-100 underline cursor-pointer"
                >
                  অ্যাকাউন্ট তৈরি করুন
                </button>
              </span>
            ) : (
              <span>
                ইতোমধ্যে অ্যাকাউন্ট আছে?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setLocalError(null);
                    setMode('signin');
                  }}
                  className="font-semibold text-zinc-900 dark:text-zinc-100 underline cursor-pointer"
                >
                  সাইন ইন করুন
                </button>
              </span>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            {/* 1-Click Instant Guest Profile */}
            <button
              type="button"
              onClick={() => signInAsGuest('অ্যাস্ট্রো সদস্য')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
              <span>সাইন ইন ছাড়াই গেস্ট হিসেবে চালিয়ে যান (তাৎক্ষণিক শুরু)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
