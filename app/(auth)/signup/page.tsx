'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const router = useRouter();
  const { signup, signInWithGoogle, signInWithMicrosoft } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    
    try {
      const { user } = await signup(email, password);
      
      if (user) {
        // Wait a moment for the session to be fully established
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirect to onboarding for first-time users
        window.location.href = '/onboarding';
      }
    } catch (err: any) {
      setError(err?.message || 'Signup failed. Please try again.');
      console.error('Signup error:', err);
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // OAuth will redirect automatically to callback, which handles onboarding check
    } catch (err: any) {
      setError(err?.message || 'Google signup failed');
      console.error('Google signup error:', err);
      setIsLoading(false);
    }
  };

  const handleOutlookSignup = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithMicrosoft();
      // OAuth will redirect automatically to callback, which handles onboarding check
    } catch (err: any) {
      setError(err?.message || 'Outlook signup failed');
      console.error('Outlook signup error:', err);
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #A5B4FC 0%, #C7D2FE 50%, #EEF2FF 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      paddingTop: 'max(16px, env(safe-area-inset-top))',
      paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      overflow: 'hidden'
    }}>
      
      {/* Animated Background Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          top: '-140px',
          right: '-140px',
          width: '280px',
          height: '280px',
          background: 'rgba(192, 132, 252, 0.3)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          bottom: '-140px',
          left: '-140px',
          width: '320px',
          height: '320px',
          background: 'rgba(96, 165, 250, 0.3)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '393px',
          zIndex: 10
        }}
      >
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
          overflow: 'hidden'
        }}>
          
          {/* Top Gradient Strip */}
          <div style={{
            height: '6px',
            background: 'linear-gradient(90deg, #6366F1 0%, #A855F7 50%, #3B82F6 100%)'
          }} />

          <div style={{ padding: '36px 28px 32px 28px' }}>
            
            {/* Logo & Tagline */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{
                fontSize: '30px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '6px',
                letterSpacing: '-0.5px'
              }}>
                CalmScroll
              </h1>
              <p style={{
                fontSize: '13px',
                color: '#6B7280',
                fontWeight: '500'
              }}>
                Break the doom scroll
              </p>
            </div>

            {/* Welcome Text */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '4px',
                letterSpacing: '-0.3px'
              }}>
                Create Account
              </h2>
              <p style={{
                fontSize: '13px',
                color: '#6B7280'
              }}>
                Start your mindful journey today
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginBottom: '20px',
                  padding: '12px 16px',
                  background: '#FEF2F2',
                  border: '2px solid #FCA5A5',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <svg
                  style={{
                    width: '18px',
                    height: '18px',
                    color: '#DC2626',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{
                  fontSize: '13px',
                  color: '#991B1B',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {error}
                </p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSignup}>
              
              {/* Email Field */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <svg
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      color: '#9CA3AF',
                      pointerEvents: 'none'
                    }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      fontSize: '15px',
                      background: '#F9FAFB',
                      border: '2px solid transparent',
                      borderRadius: '14px',
                      color: '#1F2937',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      WebkitAppearance: 'none',
                      appearance: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.background = '#FFFFFF';
                      e.target.style.borderColor = '#818CF8';
                      e.target.style.boxShadow = '0 0 0 4px rgba(129, 140, 248, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.background = '#F9FAFB';
                      e.target.style.borderColor = 'transparent';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <svg
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      color: '#9CA3AF',
                      pointerEvents: 'none'
                    }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      fontSize: '15px',
                      background: '#F9FAFB',
                      border: '2px solid transparent',
                      borderRadius: '14px',
                      color: '#1F2937',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      WebkitAppearance: 'none',
                      appearance: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.background = '#FFFFFF';
                      e.target.style.borderColor = '#818CF8';
                      e.target.style.boxShadow = '0 0 0 4px rgba(129, 140, 248, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.background = '#F9FAFB';
                      e.target.style.borderColor = 'transparent';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <svg
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      color: '#9CA3AF',
                      pointerEvents: 'none'
                    }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 44px',
                      fontSize: '15px',
                      background: '#F9FAFB',
                      border: '2px solid transparent',
                      borderRadius: '14px',
                      color: '#1F2937',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      WebkitAppearance: 'none',
                      appearance: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.background = '#FFFFFF';
                      e.target.style.borderColor = '#818CF8';
                      e.target.style.boxShadow = '0 0 0 4px rgba(129, 140, 248, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.background = '#F9FAFB';
                      e.target.style.borderColor = 'transparent';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Sign Up Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #3B82F6 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(99, 102, 241, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.3)';
                }}
              >
                {isLoading ? (
                  <>
                    <svg style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '24px 0 20px 0'
            }}>
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '1px',
                background: '#E5E7EB'
              }} />
              <div style={{
                position: 'relative',
                background: '#FFFFFF',
                padding: '0 14px',
                fontSize: '11px',
                color: '#9CA3AF',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Or sign up with
              </div>
            </div>

            {/* Social Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '24px'
            }}>
              {/* Google Button */}
              <motion.button
                type="button"
                onClick={handleGoogleSignup}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px 12px',
                  background: '#FFFFFF',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Google</span>
              </motion.button>

              {/* Outlook Button */}
              <motion.button
                type="button"
                onClick={handleOutlookSignup}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px 12px',
                  background: '#FFFFFF',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0078D4">
                  <path d="M3 4.5h9v9H3zm11 0h7v9h-7zM3 15h9v4.5H3zm11 0h7v4.5h-7z" />
                </svg>
                <span>Outlook</span>
              </motion.button>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '11px',
                color: '#9CA3AF',
                lineHeight: '1.5',
                marginBottom: '14px'
              }}>
                By signing up, you agree to our{' '}
                <a href="#" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: '500' }}>Terms</a>
                {' '}and{' '}
                <a href="#" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: '500' }}>Privacy Policy</a>
              </p>
              
              <div style={{
                paddingTop: '14px',
                borderTop: '1px solid #F3F4F6'
              }}>
                <p style={{
                  fontSize: '13px',
                  color: '#6B7280'
                }}>
                  Already have an account?{' '}
                  <a href="/login" style={{
                    color: '#6366F1',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}>
                    Sign in
                  </a>
                </p>
              </div>
            </div>

          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #F9FAFB inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}