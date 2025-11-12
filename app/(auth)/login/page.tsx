'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Leaf, Mail, Lock, Loader2 } from 'lucide-react';
import { SparklesCore } from '@/components/ui/sparkles';

export default function LoginPage() {
  const router = useRouter();
  const { login, signInWithGoogle, signInWithMicrosoft } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setIsLoading(true);
    try {
      await login(email, password);
    } catch (err:any) {
      setError(err?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null); setIsLoading(true);
    try { await signInWithGoogle(); } catch (e:any) { setError(e?.message || 'Google sign-in failed'); setIsLoading(false); }
  };
  
  const handleOutlook = async () => {
    setError(null); setIsLoading(true);
    try { await signInWithMicrosoft(); } catch (e:any) { setError(e?.message || 'Outlook sign-in failed'); setIsLoading(false); }
  };

  return (
    <>
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          background: linear-gradient(to bottom, #f0fdf4, #ffffff);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        
        @media (max-width: 768px) {
          .login-container {
            background: linear-gradient(to bottom, #2d3e35, #1a2520);
          }
        }
      `}</style>

      <div className="login-container">
        {/* SparklesCore Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}>
          <SparklesCore
            id="loginSparkles"
            background="transparent"
            minSize={0.5}
            maxSize={2}
            particleDensity={50}
            className="w-full h-full"
            particleColor="#4ade80"
            speed={0.3}
          />
        </div>

        {/* Login Card */}
        <div style={{
          width: '420px',
          maxWidth: '100%',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(34, 197, 94, 0.2)'
            }}>
              <Leaf size={32} style={{ color: '#15803d' }} strokeWidth={2.5} />
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em'
            }}>
              Welcome Back
            </h1>
            <p style={{
              fontSize: '15px',
              color: '#64748b',
              margin: 0,
              fontWeight: '500'
            }}>
              Sign in to continue your wellness journey
            </p>
          </div>

          {error && (
            <div style={{
              color: '#dc2626',
              fontSize: '14px',
              marginBottom: '20px',
              padding: '14px',
              background: '#fee2e2',
              borderRadius: '16px',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#64748b',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail 
                  size={18} 
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }}
                  strokeWidth={2}
                />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 44px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    fontSize: '15px',
                    color: '#0f172a',
                    background: '#f8fafc',
                    outline: 'none',
                    fontWeight: '500'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#64748b',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={18} 
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }}
                  strokeWidth={2}
                />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 44px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    fontSize: '15px',
                    color: '#0f172a',
                    background: '#f8fafc',
                    outline: 'none',
                    fontWeight: '500'
                  }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontSize: '16px',
                fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '24px 0'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ 
              fontSize: '13px', 
              color: '#94a3b8', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Or continue with
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button 
              type="button" 
              onClick={handleGoogle} 
              disabled={isLoading} 
              style={{
                flex: 1,
                padding: '14px',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                background: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }
              }}
            >
              Google
            </button>
            <button 
              type="button" 
              onClick={handleOutlook} 
              disabled={isLoading} 
              style={{
                flex: 1,
                padding: '14px',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                background: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }
              }}
            >
              Outlook
            </button>
          </div>

          <p style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#64748b',
            margin: 0,
            fontWeight: '500'
          }}>
            New here?{' '}
            <a 
              onClick={() => router.push('/signup')} 
              style={{
                color: '#16a34a',
                cursor: 'pointer',
                fontWeight: '700',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Create an account
            </a>
          </p>
        </div>
      </div>
    </>
  );
}