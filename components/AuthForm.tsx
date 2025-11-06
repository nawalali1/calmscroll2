'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

type Mode = 'login' | 'signup';

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { login, signup, signInWithGoogle, signInWithMicrosoft } = useAuth();

  // keep your styling; these are just states + handlers
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isSignup) {
        if (!email.includes('@')) throw new Error('Enter a valid email.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        if (password !== confirmPassword) throw new Error('Passwords do not match.');
        await signup(email, password);          // -> /onboarding
      } else {
        await login(email, password);           // -> /home
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle(); // handled by /callback
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
      setIsLoading(false);
    }
  };

  const handleOutlook = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithMicrosoft(); // handled by /callback
    } catch (err: any) {
      setError(err?.message || 'Outlook sign-in failed');
      setIsLoading(false);
    }
  };

  // ⬇️ Replace the markup below with YOUR exact HTML/CSS if you want.
  // Keep: form onSubmit={handleSubmit}, input value/onChange, and button handlers.
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:360,border:'1px solid #e2e8f0',borderRadius:12,padding:16,background:'#fff'}}>
        <h1 style={{textAlign:'center',marginBottom:12}}>
          {isSignup ? 'Create account' : 'Welcome back'}
        </h1>

        {error && <div style={{color:'#b91c1c',fontSize:14,marginBottom:8}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:8}}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              style={{width:'100%',padding:'10px',border:'1px solid #e2e8f0',borderRadius:8}}
              required
            />
          </div>
          <div style={{marginBottom:8}}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              style={{width:'100%',padding:'10px',border:'1px solid #e2e8f0',borderRadius:8}}
              required
              minLength={6}
            />
          </div>
          {isSignup && (
            <div style={{marginBottom:8}}>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                style={{width:'100%',padding:'10px',border:'1px solid #e2e8f0',borderRadius:8}}
                required
                minLength={6}
              />
            </div>
          )}

          <button type="submit" disabled={isLoading} style={{width:'100%',padding:'10px',borderRadius:8,background:'#6366F1',color:'#fff'}}>
            {isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>

        <div style={{display:'flex',gap:8,marginTop:10}}>
          <button onClick={handleGoogle} disabled={isLoading} style={{flex:1,padding:'8px',border:'1px solid #e2e8f0',borderRadius:8}}>Google</button>
          <button onClick={handleOutlook} disabled={isLoading} style={{flex:1,padding:'8px',border:'1px solid #e2e8f0',borderRadius:8}}>Outlook</button>
        </div>

        <p style={{textAlign:'center',fontSize:12,marginTop:10}}>
          {isSignup ? (
            <>Already have an account? <a onClick={()=>router.push('/login')} style={{color:'#6366F1',cursor:'pointer'}}>Log in</a></>
          ) : (
            <>New here? <a onClick={()=>router.push('/signup')} style={{color:'#6366F1',cursor:'pointer'}}>Create an account</a></>
          )}
        </p>
      </div>
    </div>
  );
}
