'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { getMonthBounds, getDateRange } from '@/lib/utils';

interface CalendarMonthProps {
  onDateSelect?: (date: Date) => void;
  markedDates?: string[]; // ISO date strings with items
}

export default function CalendarMonth({
  onDateSelect,
  markedDates = [],
}: CalendarMonthProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const { start, end } = getMonthBounds(currentDate);

  // Get all dates in the month
  const daysInMonth = getDateRange(start, end);

  // Get day of week for first day (0 = Sunday)
  const firstDayOfWeek = start.getDay();

  // Weeks array
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(firstDayOfWeek).fill(null);

  daysInMonth.forEach((day) => {
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    week.push(day);
  });

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const isMarked = (date: Date) => {
    const isoStr = date.toISOString().split('T')[0];
    return markedDates.some((d) => d.startsWith(isoStr));
  };

  return (
    <div className="space-y-4">
      {/* Month header */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-mist-25 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <h2 className="font-semibold text-slate-900">{monthName}</h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-mist-25 rounded-lg transition-colors"
        >
          <ChevronRight size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 px-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-slate-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1 px-2">
        {weeks.map((week, i) => (
          <div key={i} className="grid grid-cols-7 gap-1">
            {week.map((day, j) => (
              <button
                key={j}
                onClick={() => day && onDateSelect?.(day)}
                disabled={!day}
                className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-colors ${
                  day
                    ? 'hover:bg-mist-25 cursor-pointer'
                    : 'cursor-default'
                } ${
                  day && isMarked(day)
                    ? 'bg-calm-blue-50 font-semibold text-calm-blue-500'
                    : 'text-slate-700'
                }`}
              >
                {day && (
                  <>
                    <span>{day.getDate()}</span>
                    {isMarked(day) && (
                      <span className="w-1 h-1 bg-calm-blue-500 rounded-full"></span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}