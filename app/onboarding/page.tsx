'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const finish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login?notice=confirm_email');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(
          { id: user.id, display_name: displayName || null, onboarding_complete: true },
          { onConflict: 'id' }
        );
      if (error) throw error;

      router.replace('/home');
    } catch (e:any) {
      setError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <form onSubmit={finish} style={{width:360,border:'1px solid #e2e8f0',borderRadius:12,padding:16,background:'#fff'}}>
        <h1 style={{textAlign:'center',marginBottom:12}}>Let’s get you set up</h1>
        {error && <p style={{color:'#b91c1c',fontSize:14}}>{error}</p>}
        <label style={{display:'block',fontSize:12,margin:'6px 0'}}>Display name (optional)</label>
        <input
          value={displayName}
          onChange={(e)=>setDisplayName(e.target.value)}
          placeholder="e.g. Nawal"
          style={{width:'100%',padding:'10px',border:'1px solid #e2e8f0',borderRadius:8}}
        />
        <button type="submit" disabled={saving} style={{marginTop:10,width:'100%',padding:'10px',borderRadius:8,background:'#6366F1',color:'#fff'}}>
          {saving ? 'Saving…' : 'Finish onboarding'}
        </button>
      </form>
    </div>
  );
}
