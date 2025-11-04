'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { saveInterests, updateProfile } from '@/lib/db';
import { Loader } from 'lucide-react';

const INTERESTS = [
  'Exercise', 'Reading', 'Prayer', 'Meditation', 'Journaling',
  'Music', 'Art', 'Cooking', 'Nature', 'Learning'
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Redirect to login if auth check is complete and user is not logged in
  if (!authLoading && !user) {
    router.replace('/login');
    return null;
  }

  const toggleInterest = (interest: string) => {
    setSelected(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleComplete = async () => {
    if (!user || selected.length === 0) return;
    setLoading(true);
    try {
      await saveInterests(user.id, selected);
      await updateProfile(user.id, { onboarding_complete: true });
      router.replace('/home');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Welcome to CalmScroll</h1>
        <p className="text-slate-600">What activities help you stay mindful?</p>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-3">
        {INTERESTS.map(interest => (
          <button
            key={interest}
            onClick={() => toggleInterest(interest)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selected.includes(interest)
                ? 'border-calm-blue-500 bg-calm-blue-50 text-calm-blue-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            {interest}
          </button>
        ))}
      </div>
      <button
        onClick={handleComplete}
        disabled={selected.length === 0 || loading}
        className="w-full bg-calm-blue-500 hover:bg-calm-blue-600 text-white py-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader size={20} className="animate-spin mx-auto" /> : 'Continue'}
      </button>
    </div>
  );
}
