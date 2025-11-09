'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const router = useRouter();
  const { signup, signInWithGoogle, signInWithMicrosoft } = useAuth();
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setIsLoading(true);
    try { 
      await signup(email, password);
      router.replace('/onboarding');
    }
    catch (err:any) { setError(err?.message || 'Signup failed.'); }
    finally { setIsLoading(false); }
  };

  const handleGoogle = async () => { try { await signInWithGoogle(); } catch (e:any){ setError(e?.message || 'Google failed'); } };
  const handleOutlook = async () => { try { await signInWithMicrosoft(); } catch (e:any){ setError(e?.message || 'Outlook failed'); } };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:360,margin:'80px auto',padding:16,border:'1px solid #e2e8f0',borderRadius:12}}>
      <h1>Create your account</h1>
      {error && <div style={{color:'#b91c1c'}}>{error}</div>}
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required
        style={{width:'100%',padding:'10px',border:'1px solid #e2e8f0',borderRadius:8,marginBottom:8}}/>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required
        style={{width:'100%',padding:'10px',border:'1px solid #e2e8f0',borderRadius:8,marginBottom:8}}/>
      <button type="submit" disabled={isLoading} style={{width:'100%',padding:'10px',borderRadius:8,background:'#6366F1',color:'#fff'}}>
        {isLoading ? 'Creating account…' : 'Sign up'}
      </button>
      <div style={{display:'flex',gap:8,marginTop:10}}>
        <button type="button" onClick={handleGoogle} style={{flex:1,padding:'8px'}}>Google</button>
        <button type="button" onClick={handleOutlook} style={{flex:1,padding:'8px'}}>Outlook</button>
      </div>
    </form>
  );
}