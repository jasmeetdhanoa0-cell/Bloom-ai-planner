import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface BloomDropdownOption<T extends string = string> {
  value: T;
  label: string;
  emoji?: string;
  icon?: React.ReactNode;
  desc?: string;
}

interface BloomDropdownProps<T extends string = string> {
  value: T;
  onChange: (val: T) => void;
  options: BloomDropdownOption<T>[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
}

export function BloomDropdown<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  icon,
  className = '',
  menuClassName = '',
  disabled = false,
  align = 'left',
}: BloomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optValue: T) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card-subtle)] text-[var(--bloom-text)] text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs hover:border-[var(--bloom-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--bloom-primary)]/40 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none ${
          isOpen ? 'ring-2 ring-[var(--bloom-primary)]/40 border-[var(--bloom-primary)]' : ''
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {icon && <span className="shrink-0">{icon}</span>}
          {selectedOption?.emoji && <span className="text-sm shrink-0">{selectedOption.emoji}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--bloom-text-muted)] shrink-0 transition-transform duration-200 ease-out ${
            isOpen ? 'rotate-180 text-[var(--bloom-primary)]' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu (Guaranteed Dark Bloom Card Background, No White Rectangle) */}
      <div
        className={`absolute mt-1.5 w-full min-w-[200px] z-50 rounded-2xl border border-[var(--bloom-border)] bg-[var(--bloom-card)] text-[var(--bloom-text)] p-1.5 shadow-xl transition-all duration-200 ease-out origin-top ${
          align === 'right' ? 'right-0' : 'left-0'
        } ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible'
            : 'opacity-0 scale-95 -translate-y-1.5 pointer-events-none invisible'
        } ${menuClassName}`}
        style={{
          maxHeight: '280px',
          overflowY: 'auto',
          backgroundColor: 'var(--bloom-card)',
          color: 'var(--bloom-text)',
        }}
        role="listbox"
      >
        <div className="space-y-0.5">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between gap-2.5 transition-colors duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-pink-500/15 text-[var(--bloom-primary)] font-bold'
                    : 'text-[var(--bloom-text)] hover:bg-[var(--bloom-card-subtle)] hover:text-[var(--bloom-primary)]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 truncate">
                  {opt.emoji && <span className="text-sm shrink-0">{opt.emoji}</span>}
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <div className="truncate">
                    <span className="block truncate">{opt.label}</span>
                    {opt.desc && (
                      <span className="text-[10px] text-[var(--bloom-text-muted)] font-normal block truncate">
                        {opt.desc}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[var(--bloom-primary)] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
