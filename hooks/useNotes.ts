'use client';

import { useCallback, useEffect, useState } from 'react';
import { debounce } from '@/lib/utils';
import {
  listNotes,
  searchNotes,
  createNote,
  updateNote,
  deleteNote,
} from '@/lib/db';
import type { Note, CreateNoteInput, UpdateNoteInput } from '@/lib/validations';

interface UseNotesOpts {
  userId?: string;
}

export const useNotes = ({ userId }: UseNotesOpts) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await listNotes(userId);
      setNotes(data);
      setFilteredNotes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Debounced search
  const handleSearch = useCallback(
    debounce(async (query: string) => {
      if (!userId) return;
      if (!query.trim()) {
        setFilteredNotes(notes);
        return;
      }

      try {
        const results = await searchNotes(userId, query);
        setFilteredNotes(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      }
    }, 300),
    [userId, notes]
  );

  useEffect(() => {
    setSearchQuery('');
    handleSearch('');
  }, [userId, handleSearch]);

  // Create note
  const createNewNote = useCallback(
    async (input: CreateNoteInput) => {
      if (!userId) throw new Error('User not authenticated');
      try {
        const newNote = await createNote({ ...input, user_id: userId });
        setNotes((prev) => [newNote, ...prev]);
        setFilteredNotes((prev) => [newNote, ...prev]);
        return newNote;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create note';
        setError(msg);
        throw err;
      }
    },
    [userId]
  );

  // Update note
  const updateExistingNote = useCallback(
    async (noteId: string, input: UpdateNoteInput) => {
      try {
        const updated = await updateNote(noteId, input);
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? updated : n))
        );
        setFilteredNotes((prev) =>
          prev.map((n) => (n.id === noteId ? updated : n))
        );
        return updated;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update note';
        setError(msg);
        throw err;
      }
    },
    []
  );

  // Delete note
  const deleteExistingNote = useCallback(async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      setFilteredNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete note';
      setError(msg);
      throw err;
    }
  }, []);

  return {
    notes: filteredNotes,
    allNotes: notes,
    loading,
    error,
    searchQuery,
    onSearch: (q: string) => {
      setSearchQuery(q);
      handleSearch(q);
    },
    createNote: createNewNote,
    updateNote: updateExistingNote,
    deleteNote: deleteExistingNote,
    refetch: fetchNotes,
  };
};