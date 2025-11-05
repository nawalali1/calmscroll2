'use client';

import { useState } from 'react';
import { LogOut, Bell, Moon, Clock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ checked, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
        checked ? 'bg-[#6366F1]' : 'bg-[#E2E8F0]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="switch"
      aria-checked={checked}
    >
      <motion.div
        className="inline-block h-5 w-5 transform rounded-full bg-white shadow-md"
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [breathingReminders, setBreathingReminders] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
      setIsSigningOut(false);
    }
  };

  return (
    <motion.div
      className="flex-1 flex flex-col bg-gradient-to-b from-[#EEF2F7] to-[#E0E7FF] overflow-y-auto pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="px-6 py-6 border-b border-[#C7D2FE]/30"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-2xl font-semibold text-[#1E293B]">Settings</h1>
        <p className="text-sm text-[#64748B] mt-1">Manage your preferences</p>
      </motion.div>

      {/* Content */}
      <motion.div
        className="flex-1 px-6 py-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Section */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl p-6 shadow-md shadow-indigo-100">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#C7D2FE] to-[#A5B4FC] flex items-center justify-center">
                <User size={20} className="text-[#6366F1]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-[#1E293B]">
                  {user?.email?.split('@')[0] || 'User'}
                </h3>
                <p className="text-sm text-[#64748B] mt-1">{user?.email}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* General Settings Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-[#64748B] uppercase tracking-wide px-2 mb-3">
            General
          </h2>
          <div className="bg-white rounded-2xl overflow-hidden shadow-md shadow-indigo-100">
            {/* Notifications */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#EEF2F7] rounded-lg">
                  <Bell size={18} className="text-[#6366F1]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1E293B]">Notifications</p>
                  <p className="text-xs text-[#64748B] mt-0.5">Daily updates and reminders</p>
                </div>
              </div>
              <ToggleSwitch checked={notifications} onChange={setNotifications} />
            </div>

            {/* Breathing Reminders */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#EEF2F7] rounded-lg">
                  <Clock size={18} className="text-[#6366F1]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1E293B]">Breathing Reminders</p>
                  <p className="text-xs text-[#64748B] mt-0.5">Mindful breathing prompts</p>
                </div>
              </div>
              <ToggleSwitch checked={breathingReminders} onChange={setBreathingReminders} />
            </div>
          </div>
        </motion.div>

        {/* App Settings Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-[#64748B] uppercase tracking-wide px-2 mb-3">
            Appearance
          </h2>
          <div className="bg-white rounded-2xl overflow-hidden shadow-md shadow-indigo-100">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#EEF2F7] rounded-lg">
                  <Moon size={18} className="text-[#6366F1]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1E293B]">Theme</p>
                  <p className="text-xs text-[#64748B] mt-0.5">Light mode</p>
                </div>
              </div>
              <span className="text-xs font-medium text-[#A5B4FC]">Static</span>
            </div>
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-[#64748B] uppercase tracking-wide px-2 mb-3">
            About
          </h2>
          <div className="bg-white rounded-2xl overflow-hidden shadow-md shadow-indigo-100">
            <div className="px-6 py-4 border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#1E293B]">App Version</p>
                <p className="text-sm font-medium text-[#6366F1]">1.0.0</p>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#1E293B]">Build</p>
                <p className="text-sm font-medium text-[#64748B]">2025.11</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sign Out Button */}
        <motion.button
          variants={itemVariants}
          onClick={handleSignOut}
          disabled={isSigningOut}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#FEE2E2] hover:bg-[#FEC2C2] text-[#B91C1C] font-semibold py-3 rounded-2xl transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-red-100"
        >
          <LogOut size={18} />
          Sign Out
        </motion.button>

        {/* Footer Text */}
        <motion.p
          variants={itemVariants}
          className="text-xs text-[#64748B] text-center px-4"
        >
          CalmScroll helps you break the doom scroll. Reset, plan, and refocus.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
