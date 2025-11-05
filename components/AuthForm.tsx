'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, signup, signInWithGoogle, signInWithMicrosoft } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Validation checks
  const isEmailValid = email.length > 0 && email.includes('@');
  const isPasswordValid = password.length >= 6;
  const isConfirmPasswordValid = mode === 'signup' ? password === confirmPassword : true;
  const isFormValid = isEmailValid && isPasswordValid && isConfirmPasswordValid;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setError('Please fill in all fields correctly');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.href = '/';
      } else {
        const { user } = await signup(email, password);
        if (user) {
          // Wait for session to be established
          await new Promise(resolve => setTimeout(resolve, 500));
          // Redirect new users to onboarding
          window.location.href = '/onboarding';
        }
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Authentication failed';
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
      setIsLoading(false);
    }
  };

  const handleOutlookSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithMicrosoft();
    } catch (err: any) {
      setError(err?.message || 'Outlook sign-in failed');
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-[380px]"
    >
      {/* Glassy Card Container */}
      <div className="rounded-[28px] bg-white/80 backdrop-blur-lg shadow-2xl overflow-hidden border border-white/50">

        {/* Top Curved Gradient Stripe */}
        <div className="h-20 bg-gradient-to-r from-[#C7D2FE] to-[#6366F1]" style={{
          borderRadius: '28px 28px 50% 50%',
        }} />

        {/* Main Content */}
        <div className="p-6 sm:p-8 space-y-5">

          {/* Logo and Tagline */}
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#6366F1] to-[#A5B4FC]">
              CalmScroll
            </h1>
            <p className="text-sm text-[#64748B]">Break the doom scroll</p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              aria-live="assertive"
              className="flex gap-3 bg-red-50 border border-red-200 rounded-2xl p-4"
            >
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[#1E293B]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  aria-disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E6E9F8] px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1] shadow-sm text-[#1E293B] placeholder-[#94A3B8] transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {touched.email && !isEmailValid && email.length > 0 && (
                <p className="text-xs text-red-600">Please enter a valid email</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[#1E293B]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  placeholder="••••••••"
                  disabled={isLoading}
                  minLength={6}
                  aria-busy={isLoading}
                  aria-disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E6E9F8] px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1] shadow-sm text-[#1E293B] placeholder-[#94A3B8] transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {touched.password && !isPasswordValid && password.length > 0 && (
                <p className="text-xs text-red-600">Password must be at least 6 characters</p>
              )}
            </div>

            {/* Confirm Password Input (Sign Up Only) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1E293B]">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                    placeholder="••••••••"
                    disabled={isLoading}
                    minLength={6}
                    aria-busy={isLoading}
                    aria-disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E6E9F8] px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#6366F1] shadow-sm text-[#1E293B] placeholder-[#94A3B8] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                {touched.confirmPassword && password !== confirmPassword && confirmPassword.length > 0 && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !isFormValid}
              whileHover={{ scale: isLoading || !isFormValid ? 1 : 1.02 }}
              whileTap={{ scale: isLoading || !isFormValid ? 1 : 0.98 }}
              aria-busy={isLoading}
              aria-disabled={isLoading || !isFormValid}
              className="w-full rounded-2xl bg-[#6366F1] text-white font-semibold py-3 shadow-md transition transform hover:scale-[1.02] hover:bg-[#4F46E5] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoading
                ? mode === 'login'
                  ? 'Signing in…'
                  : 'Creating account…'
                : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </motion.button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-[1px] bg-[#E6E9F8]" />
            <div className="text-xs text-[#94A3B8]">OR</div>
            <div className="flex-1 h-[1px] bg-[#E6E9F8]" />
          </div>

          {/* OAuth Buttons Container */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Google OAuth Button */}
            <motion.button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.03 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              aria-busy={isLoading}
              aria-disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-3 border border-[#E6E9F8] rounded-2xl py-2 bg-white hover:bg-[#F8FAFC] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-label="Google icon">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-medium text-[#1E293B]">Google</span>
            </motion.button>

            {/* Outlook OAuth Button */}
            <motion.button
              type="button"
              onClick={handleOutlookSignIn}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.03 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              aria-busy={isLoading}
              aria-disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-3 border border-[#E6E9F8] rounded-2xl py-2 bg-white hover:bg-[#F8FAFC] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-label="Outlook icon">
                <path d="M3 5h9v9H3zm11 0h7v9h-7zM3 16h9v3H3zm11 0h7v3h-7z" fill="#0078D4" />
              </svg>
              <span className="text-sm font-medium text-[#1E293B]">Outlook</span>
            </motion.button>
          </div>

          {/* Legal Text */}
          <p className="text-xs text-center text-[#94A3B8] leading-relaxed">
            By signing in, you agree to our <a href="#" className="text-[#6366F1] hover:underline">Terms of Service</a> and <a href="#" className="text-[#6366F1] hover:underline">Privacy Policy</a>
          </p>

        </div>
      </div>
    </motion.div>
  );
}