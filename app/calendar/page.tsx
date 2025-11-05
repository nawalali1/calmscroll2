'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DayActivity {
  date: Date;
  mood?: string;
  journalEntry?: string;
  breathingSessions?: number;
  hasActivity: boolean;
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10)); // November 2025
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(null);

  // Generate mock activity data for demo
  const getActivityForDay = (date: Date): DayActivity => {
    const dayOfMonth = date.getDate();
    const hasActivity = Math.random() > 0.5 && dayOfMonth > 0;
    return {
      date,
      mood: hasActivity ? ['Calm', 'Focused', 'Peaceful', 'Mindful'][Math.floor(Math.random() * 4)] : undefined,
      journalEntry: hasActivity ? `A moment of reflection on day ${dayOfMonth}` : undefined,
      breathingSessions: hasActivity ? Math.floor(Math.random() * 3) + 1 : 0,
      hasActivity,
    };
  };

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  // Create array of days to display
  const calendarDays: (DayActivity | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    calendarDays.push(getActivityForDay(date));
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (day: DayActivity) => {
    setSelectedDay(day);
  };

  return (
    <motion.div
      className="flex-1 flex flex-col bg-[#EEF2F7] overflow-y-auto pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="px-6 py-6 border-b border-[#C7D2FE]/30"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-2xl font-semibold text-[#1E293B]">Your Activity</h1>
        <p className="text-sm text-[#64748B] mt-1">Track your mindfulness journey</p>
      </motion.div>

      {/* Month Navigation */}
      <motion.div
        className="px-6 py-6 flex items-center justify-between"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <button
          onClick={handlePrevMonth}
          className="text-[#64748B] hover:text-[#1E293B] transition-colors p-2"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[#1E293B]">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>
        <button
          onClick={handleNextMonth}
          className="text-[#64748B] hover:text-[#1E293B] transition-colors p-2"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </motion.div>

      {/* Day Labels */}
      <motion.div
        className="px-6 grid grid-cols-7 gap-2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {dayNames.map(day => (
          <div key={day} className="text-xs font-semibold text-[#64748B] py-2">
            {day}
          </div>
        ))}
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        className="px-6 py-4"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.02 },
          },
        }}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dayActivity, idx) =>
            dayActivity ? (
              <motion.button
                key={`day-${dayActivity.date.getDate()}`}
                onClick={() => handleDayClick(dayActivity)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 },
                }}
                className={`aspect-square rounded-2xl font-semibold text-sm transition-all relative ${
                  dayActivity.hasActivity
                    ? 'bg-[#C7D2FE] text-[#6366F1] shadow-md shadow-indigo-100 hover:bg-[#A5B4FC]'
                    : 'bg-white/40 text-[#64748B] hover:bg-white/60 border border-[#C7D2FE]/30'
                }`}
              >
                {dayActivity.date.getDate()}
                {dayActivity.hasActivity && (
                  <motion.div
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[#6366F1] rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + idx * 0.02 }}
                  />
                )}
              </motion.button>
            ) : (
              <div key={`empty-${idx}`} className="aspect-square" />
            )
          )}
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selectedDay && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              style={{ zIndex: 40 }}
            />

            {/* Modal Content */}
            <motion.div
              className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white rounded-t-3xl p-6 shadow-lg"
              initial={{ y: 400, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ zIndex: 50 }}
            >
              <div className="flex flex-col gap-4">
                {/* Modal Header */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-[#1E293B]">
                    {monthNames[selectedDay.date.getMonth()]} {selectedDay.date.getDate()}
                  </h3>
                  <p className="text-sm text-[#64748B] mt-1">
                    {selectedDay.date.toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                </div>

                {/* Activity Content */}
                <div className="space-y-4">
                  {/* Mood */}
                  {selectedDay.mood && (
                    <div className="bg-[#EEF2F7] rounded-2xl p-4">
                      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Mood</p>
                      <p className="text-base text-[#1E293B] font-medium mt-1">{selectedDay.mood}</p>
                    </div>
                  )}

                  {/* Journal Entry */}
                  {selectedDay.journalEntry && (
                    <div className="bg-[#EEF2F7] rounded-2xl p-4">
                      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Journal</p>
                      <p className="text-sm text-[#1E293B] mt-1">{selectedDay.journalEntry}</p>
                    </div>
                  )}

                  {/* Breathing Sessions */}
                  {selectedDay.breathingSessions && selectedDay.breathingSessions > 0 && (
                    <div className="bg-[#EEF2F7] rounded-2xl p-4">
                      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Breathing Sessions</p>
                      <p className="text-base text-[#1E293B] font-medium mt-1">{selectedDay.breathingSessions} session{selectedDay.breathingSessions > 1 ? 's' : ''}</p>
                    </div>
                  )}

                  {!selectedDay.hasActivity && (
                    <div className="text-center py-4">
                      <p className="text-[#64748B]">No activities recorded</p>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedDay(null)}
                  className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium py-3 rounded-2xl transition-colors duration-300 mt-2"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
