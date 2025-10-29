'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface ToastsProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export default function Toasts({ toasts, onRemove }: ToastsProps) {
  return (
    <div className="fixed bottom-24 left-0 right-0 flex flex-col gap-2 px-4 pointer-events-none z-40">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onRemove, toast.duration || 2500);
    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  const bgColor = {
    success: 'bg-meadow-500',
    error: 'bg-rose-500',
    info: 'bg-calm-blue-500',
  }[toast.type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }[toast.type];

  return (
    <div
      className={`${bgColor} text-white rounded-lg p-4 shadow-md flex items-center gap-3 pointer-events-auto animate-in slide-in-from-bottom-2 fade-in`}
    >
      <Icon size={20} className="flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={onRemove}
        className="text-white/80 hover:text-white flex-shrink-0"
      >
        <X size={18} />
      </button>
    </div>
  );
}

// Hook for managing toasts
export const useToasts = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    return id;
  };

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, add, remove };
};