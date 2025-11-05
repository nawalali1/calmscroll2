'use client';

import { motion } from 'framer-motion';
import AuthForm from '@/components/AuthForm';

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eaf2ff] via-[#eef2f7] to-[#fdfefe] flex items-center justify-center px-4 py-12 overflow-hidden">

      {/* Bottom Wave SVG - Decorative */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 200"
          className="w-full h-auto"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,100 Q360,50 720,100 T1440,100 L1440,200 L0,200 Z"
            fill="white"
            opacity="0.15"
          />
          <path
            d="M0,120 Q360,70 720,120 T1440,120 L1440,200 L0,200 Z"
            fill="white"
            opacity="0.1"
          />
        </svg>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full flex justify-center relative z-10"
      >
        <AuthForm mode="signup" />
      </motion.div>
    </div>
  );
}
