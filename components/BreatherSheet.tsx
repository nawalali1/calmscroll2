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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#ffffff',
        borderRadius: '24px 24px 0 0',
        padding: '24px',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Close button */}
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '8px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={24} style={{ color: '#64748b' }} />
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', paddingTop: '8px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0' }}>
            Take a breath
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            One minute to reset and refocus
          </p>
        </div>

        {/* Timer circle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ position: 'relative', width: '160px', height: '160px' }}>
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
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
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                strokeDasharray={`${(progress / 100) * 440} 440`}
                strokeLinecap="round"
                strokeDashoffset="110"
                transform="rotate(-90 80 80)"
                style={{ transition: 'all 0.5s' }}
              />
            </svg>

            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '36px', fontWeight: '600', color: '#0f172a' }}>
                {formatMMSS(seconds)}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                {isComplete ? 'Complete!' : 'remaining'}
              </span>
            </div>
          </div>
        </div>

        {/* Control buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isComplete && (
            <div style={{ display: 'flex', gap: '12px' }}>
              {!isRunning ? (
                <button
                  onClick={seconds === 60 ? onStart : onResume}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Play size={20} />
                  {seconds === 60 ? 'Start' : 'Resume'}
                </button>
              ) : (
                <button
                  onClick={onPause}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Pause size={20} />
                  Pause
                </button>
              )}
            </div>
          )}

          {isComplete ? (
            <button
              onClick={onComplete}
              style={{
                width: '100%',
                padding: '14px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          ) : (
            <button
              onClick={onCancel}
              style={{
                width: '100%',
                padding: '14px',
                background: '#e2e8f0',
                color: '#475569',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Intention box */}
        <div style={{
          marginTop: '16px',
          background: '#dcfce7',
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '12px', color: '#15803d', fontWeight: '500', margin: 0 }}>
            Remember: You're in control. Breathe.
          </p>
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}