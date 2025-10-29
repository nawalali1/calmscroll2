'use client';

import { Trash2, MessageSquare } from 'lucide-react';
import { formatRelativeTime, formatDate } from '@/lib/utils';
import type { Note } from '@/lib/validations';

interface NoteCardProps {
  note: Note;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  compact?: boolean;
}

export default function NoteCard({
  note,
  onDelete,
  onClick,
  compact = false,
}: NoteCardProps) {
  if (!note.id) return null;

  const updatedAt = note.updated_at || note.created_at;

  return (
    <div
      onClick={() => onClick?.(note.id!)}
      className={`card cursor-pointer hover:shadow-md transition-all ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header with mood and time */}
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={16} className="text-slate-500 flex-shrink-0" />
            {note.mood && (
              <span className="text-xs font-medium text-slate-500 bg-mist-25 px-2 py-1 rounded-full">
                {note.mood}
              </span>
            )}
            <span className="text-xs text-slate-500 ml-auto">
              {updatedAt ? formatRelativeTime(updatedAt) : 'just now'}
            </span>
          </div>

          {/* Title */}
          {note.title && (
            <h3 className="font-semibold text-slate-900 text-sm mb-1 truncate">
              {note.title}
            </h3>
          )}

          {/* Content preview */}
          <p className="text-sm text-slate-600 line-clamp-2">
            {note.content}
          </p>

          {/* Due date badge */}
          {note.due_at && (
            <div className="mt-2 text-xs text-calm-blue-500 font-medium">
              Due {formatDate(note.due_at)}
            </div>
          )}
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id!);
            }}
            className="text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}