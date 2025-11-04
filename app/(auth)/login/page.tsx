'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithMicrosoft, login, signup, loading, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [mode, setMode] = useState<'oauth' | 'email'>('oauth');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      await signInWithGoogle();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      await signInWithMicrosoft();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Microsoft sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setAuthError(null);

      if (isSignUp) {
        await signup(email, password);
        setAuthError('✓ Sign up successful! Check your email to confirm your account, then sign in.');
        setEmail('');
        setPassword('');
        // Switch to sign in mode after successful signup
        setTimeout(() => {
          setIsSignUp(false);
          setAuthError(null);
        }, 3000);
      } else {
        await login(email, password);
        setAuthError(null);
        // Small delay to ensure session is set before redirect
        setTimeout(() => {
          router.push('/');
        }, 500);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMessage = err?.message || 'Authentication failed';

      if (errorMessage.includes('Email not confirmed')) {
        setAuthError('Please check your email to confirm your account before signing in.');
      } else if (errorMessage.includes('Invalid login credentials')) {
        setAuthError('Incorrect email or password.');
      } else if (errorMessage.includes('User already registered')) {
        setAuthError('This email is already registered. Try signing in instead.');
      } else {
        setAuthError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader size={32} className="text-calm-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">CalmScroll</h1>
        <p className="text-slate-600">Break the doom scroll. Reset, plan, and refocus.</p>
      </div>

      {/* Error message */}
      {(authError || error) && (
        <div className="w-full bg-rose-50 border border-rose-200 rounded-lg p-4">
          <p className="text-sm text-rose-600">{authError || error}</p>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="w-full max-w-xs flex gap-2 bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setMode('oauth')}
          className={`flex-1 py-2 rounded-md font-medium transition-all ${
            mode === 'oauth'
              ? 'bg-white text-calm-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Quick Sign In
        </button>
        <button
          onClick={() => setMode('email')}
          className={`flex-1 py-2 rounded-md font-medium transition-all ${
            mode === 'email'
              ? 'bg-white text-calm-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Email Login
        </button>
      </div>

      {/* OAuth Sign in */}
      {mode === 'oauth' && (
        <div className="w-full space-y-3 max-w-xs">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Sign in with Google
          </button>

          <button
            onClick={handleMicrosoftSignIn}
            disabled={isLoading}
            className="w-full btn-secondary flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 23 23" fill="currentColor">
                <path d="M11.4 0H0v11.4h11.4V0z" fill="#F1511B"/>
                <path d="M23 0H11.6v11.4H23V0z" fill="#80CC28"/>
                <path d="M11.4 11.6H0V23h11.4v-11.4z" fill="#00A4EF"/>
                <path d="M23 11.6H11.6V23H23v-11.4z" fill="#FFB900"/>
              </svg>
            )}
            Sign in with Outlook
          </button>
        </div>
      )}

      {/* Email/Password Auth */}
      {mode === 'email' && (
        <form onSubmit={handleEmailAuth} className="w-full max-w-xs space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-calm-blue-500 hover:bg-calm-blue-600 text-white py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <Loader size={20} className="animate-spin mx-auto" />
            ) : isSignUp ? (
              'Sign Up'
            ) : (
              'Sign In'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError(null);
              }}
              className="text-sm text-calm-blue-600 hover:underline"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      )}

      {/* Footer links */}
      <div className="text-center space-y-2 mt-8">
        <p className="text-xs text-slate-500">
          By signing in, you agree to our{' '}
          <a href="#" className="text-calm-blue-500 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-calm-blue-500 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
