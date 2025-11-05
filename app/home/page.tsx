'use client';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import NoteCard from '@/components/NoteCard';
import SearchBar from '@/components/SearchBar';
import BreatherSheet from '@/components/BreatherSheet';
import { useState } from 'react';
import { Plus, Wind, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { notes, loading: notesLoading, createNote, deleteNote } = useNotes({ userId: user?.id });
  const [showBreather, setShowBreather] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [breatherSeconds, setBreatherSeconds] = useState(300); // 5 minutes
  const [breatherProgress, setBreatherProgress] = useState(0);
  const [breatherIsRunning, setBreatherIsRunning] = useState(false);

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 18) return '🌤️ Good Afternoon';
    return '🌙 Good Evening';
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#EEF2F7]">
        <Loader size={32} className="text-[#6366F1] animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      className="flex-1 flex flex-col bg-[#EEF2F7] overflow-y-auto pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <motion.div
        className="px-6 py-6 border-b border-[#C7D2FE]/30"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1E293B]">{getGreeting()}</h1>
            <p className="text-sm text-[#64748B] mt-1">{user?.email?.split('@')[0] || 'User'}</p>
          </div>
          <motion.button
            onClick={() => setShowBreather(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#C7D2FE] hover:bg-[#A5B4FC] text-[#6366F1] p-3 rounded-2xl transition-colors duration-300 shadow-md shadow-indigo-100"
            aria-label="Take a breather"
          >
            <Wind size={20} />
          </motion.button>
        </div>
      </motion.div>

      {/* Search Section */}
      <motion.div
        className="px-6 py-4"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search your mindful moments..." />
      </motion.div>

      {/* Content Feed */}
      <motion.div
        className="flex-1 px-6 space-y-4 overflow-y-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {notesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size={24} className="text-[#6366F1] animate-spin" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <motion.div
            className="text-center py-12"
            variants={itemVariants}
          >
            <p className="text-[#64748B] text-base">{searchQuery ? 'No mindful moments found' : 'Start your journey with your first note'}</p>
          </motion.div>
        ) : (
          filteredNotes.map((note, idx) => (
            <motion.div
              key={note.id}
              variants={itemVariants}
              transition={{ delay: idx * 0.05 }}
            >
              <NoteCard note={note} onDelete={deleteNote} />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        onClick={handleCreateNote}
        disabled={isCreating}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-20 right-6 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-2xl w-14 h-14 shadow-md shadow-indigo-100 flex items-center justify-center transition-colors duration-300 disabled:opacity-50"
        aria-label="Add new note"
      >
        {isCreating ? (
          <Loader size={20} className="animate-spin" />
        ) : (
          <Plus size={20} />
        )}
      </motion.button>

      {/* Breather Modal */}
      <BreatherSheet
        isOpen={showBreather}
        onClose={() => setShowBreather(false)}
        seconds={breatherSeconds}
        progress={breatherProgress}
        isRunning={breatherIsRunning}
        onStart={() => setBreatherIsRunning(true)}
        onPause={() => setBreatherIsRunning(false)}
        onResume={() => setBreatherIsRunning(true)}
        onCancel={() => {
          setShowBreather(false);
          setBreatherSeconds(300);
          setBreatherProgress(0);
          setBreatherIsRunning(false);
        }}
        onComplete={() => {
          setShowBreather(false);
          setBreatherSeconds(300);
          setBreatherProgress(0);
          setBreatherIsRunning(false);
        }}
      />
    </motion.div>
  );
}
