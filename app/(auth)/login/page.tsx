'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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
      // onAuthStateChange will route to /home (or onboarding if needed)
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
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:360,border:'1px solid #e2e8f0',borderRadius:12,padding:16,background:'#fff'}}>
        <h1 style={{textAlign:'center',marginBottom:12}}>Welcome back</h1>
        {error && <div style={{color:'#b91c1c',fontSize:14,marginBottom:8}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:8}}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              style={{width:'100%',padding:'10px',border:'1px solid #e2e8f0',borderRadius:8}}
            />
          </div>
          <div style={{marginBottom:8}}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              style={{width:'100%',padding:'10px',border:'1px solid #e2e8f0',borderRadius:8}}
            />
          </div>
          <button type="submit" disabled={isLoading} style={{width:'100%',padding:'10px',borderRadius:8,background:'#6366F1',color:'#fff'}}>
            {isLoading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div style={{display:'flex',gap:8,marginTop:10}}>
          <button onClick={handleGoogle} disabled={isLoading} style={{flex:1,padding:'8px',border:'1px solid #e2e8f0',borderRadius:8}}>Google</button>
          <button onClick={handleOutlook} disabled={isLoading} style={{flex:1,padding:'8px',border:'1px solid #e2e8f0',borderRadius:8}}>Outlook</button>
        </div>

        <p style={{textAlign:'center',fontSize:12,marginTop:10}}>
          New here?{' '}
          <a onClick={()=>router.push('/signup')} style={{color:'#6366F1',cursor:'pointer'}}>Create an account</a>
        </p>
      </div>
    </div>
  );
}
