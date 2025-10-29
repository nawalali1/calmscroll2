'use client';

import { X, Pause, Play } from 'lucide-react';
import { formatMMSS } from '@/lib/utils';

interface BreatherSheetProps {
  isOpen: boolean;
  onClose: () => void;
  seconds: number;
  progress: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onComplete: () => void;
}

export default function BreatherSheet({
  isOpen,
  onClose,
  seconds,
  progress,
  isRunning,
  onStart,
  onPause,
  onResume,
  onCancel,
  onComplete,
}: BreatherSheetProps) {
  if (!isOpen) return null;

  const isComplete = seconds === 0;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
      <div
        className="w-full bg-white rounded-t-3xl p-6 space-y-6 animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 hover:bg-mist-25 rounded-full transition-colors"
        >
          <X size={24} className="text-slate-600" />
        </button>

        {/* Title */}
        <div className="text-center pt-2">
          <h2 className="text-2xl font-semibold text-slate-900 mb-1">
            Take a breath
          </h2>
          <p className="text-sm text-slate-500">
            One minute to reset and refocus
          </p>
        </div>

        {/* Timer circle with progress */}
        <div className="flex justify-center">
          <div className="relative w-40 h-40">
            {/* Background circle */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 160 160"
            >
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="2"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#4f8cff"
                strokeWidth="2"
                strokeDasharray={`${(progress / 100) * 440} 440`}
                strokeLinecap="round"
                strokeDashoffset="110"
                transform="rotate(-90 80 80)"
                className="transition-all duration-500"
              />
            </svg>

            {/* Timer text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-semibold text-slate-900">
                {formatMMSS(seconds)}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                {isComplete ? 'Complete!' : 'remaining'}
              </span>
            </div>
          </div>
        </div>

        {/* Control buttons */}
        <div className="space-y-3">
          {!isComplete && (
            <div className="flex gap-3">
              {!isRunning ? (
                <button
                  onClick={seconds === 60 ? onStart : onResume}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Play size={20} />
                  {seconds === 60 ? 'Start' : 'Resume'}
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Pause size={20} />
                  Pause
                </button>
              )}
            </div>
          )}

          {isComplete ? (
            <button onClick={onComplete} className="w-full btn-primary">
              Done
            </button>
          ) : (
            <button onClick={onCancel} className="w-full btn-secondary">
              Cancel
            </button>
          )}
        </div>

        {/* Intention box */}
        <div className="bg-calm-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-calm-blue-500 font-medium">
            Remember: You're in control. Breathe.
          </p>
        </div>
      </div>
    </div>
  );
}