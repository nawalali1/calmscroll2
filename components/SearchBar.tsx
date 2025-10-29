'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
}

export default function SearchBar({
  placeholder = 'Search notes...',
  value = '',
  onChange,
  onClear,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange('');
    }
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-full transition-all ${
        isFocused ? 'border-calm-blue-500 shadow-md' : ''
      }`}
    >
      <Search size={20} className="text-slate-500 flex-shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-1 bg-transparent text-slate-900 placeholder-slate-500 focus:outline-none text-base"
      />
      {value && (
        <button
          onClick={handleClear}
          className="text-slate-500 hover:text-slate-700 flex-shrink-0 transition-colors"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}