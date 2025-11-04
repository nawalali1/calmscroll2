'use client';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import NoteCard from '@/components/NoteCard';
import SearchBar from '@/components/SearchBar';
import BreatherSheet from '@/components/BreatherSheet';
import { useState } from 'react';
import { Plus, Wind, Loader } from 'lucide-react';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { notes, loading: notesLoading, createNote, updateNote, deleteNote } = useNotes({ userId: user?.id });
  const [showBreather, setShowBreather] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filteredNotes = notes.filter(note => 
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.mood?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNote = async () => {
    const content = prompt('Note content:');
    if (content?.trim()) {
      setIsCreating(true);
      try {
        await createNote({ content: content.trim() });
      } finally {
        setIsCreating(false);
      }
    }
  };

  if (authLoading) {
    return <div className="flex-1 flex items-center justify-center"><Loader size={32} className="animate-spin" /></div>;
  }

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-600">{user?.email || 'User'}</p>
        </div>
        <button onClick={() => setShowBreather(true)} className="bg-calm-blue-100 hover:bg-calm-blue-200 text-calm-blue-700 p-3 rounded-full">
          <Wind size={20} />
        </button>
      </div>
      <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search notes..." />
      <div className="flex-1 space-y-3 overflow-y-auto">
        {notesLoading ? (
          <div className="flex items-center justify-center py-12"><Loader size={24} className="animate-spin" /></div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12"><p className="text-slate-500">{searchQuery ? 'No notes found' : 'No notes yet'}</p></div>
        ) : (
          filteredNotes.map(note => <NoteCard key={note.id} note={note} onUpdate={updateNote} onDelete={deleteNote} />)
        )}
      </div>
      <button onClick={handleCreateNote} disabled={isCreating} className="bg-calm-blue-500 hover:bg-calm-blue-600 text-white fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-lg flex items-center justify-center">
        {isCreating ? <Loader size={24} className="animate-spin" /> : <Plus size={24} />}
      </button>
      {showBreather && <BreatherSheet onClose={() => setShowBreather(false)} />}
    </div>
  );
}
