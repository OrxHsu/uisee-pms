import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface LiquidDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function parseDate(v: string): { y: number; m: number; d: number } | null {
  if (!v) return null;
  const parts = v.split('-');
  if (parts.length !== 3) return null;
  return { y: +parts[0], m: +parts[1] - 1, d: +parts[2] };
}

export const LiquidDatePicker: React.FC<LiquidDatePickerProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '选择日期',
  disabled = false,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const parsed = parseDate(value);
  const displayText = parsed
    ? `${parsed.y}-${pad(parsed.m + 1)}-${pad(parsed.d)}`
    : placeholder;

  // Sync view to selected date on open
  useEffect(() => {
    if (isOpen && parsed) {
      setViewYear(parsed.y);
      setViewMonth(parsed.m);
    }
  }, [isOpen]);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const dropH = 320;
      const top =
        rect.bottom + 4 + dropH > viewportH
          ? rect.top - dropH - 4
          : rect.bottom + 4;
      setDropdownStyle({
        position: 'fixed',
        top,
        left: rect.left,
        width: Math.max(rect.width, 280),
        zIndex: 9999,
      });
    }
  }, []);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Node;
    if (
      triggerRef.current && !triggerRef.current.contains(target) &&
      dropdownRef.current && !dropdownRef.current.contains(target)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, handleClickOutside, updatePosition]);

  // Calendar logic
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else { setViewMonth(viewMonth - 1); }
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else { setViewMonth(viewMonth + 1); }
  };

  const handleSelect = (d: number) => {
    onChange(toDateStr(viewYear, viewMonth, d));
    setIsOpen(false);
  };

  const py = compact ? 'py-1.5' : 'py-2';

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const dropdownContent = isOpen
    ? createPortal(
        <div ref={dropdownRef} style={dropdownStyle} className="liquid-glass-strong p-3">
          {/* Month/Year header */}
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prevMonth} className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-light)] transition-colors cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {viewYear}年 {MONTH_NAMES[viewMonth]}
            </span>
            <button type="button" onClick={nextMonth} className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-light)] transition-colors cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-xs text-[var(--text-tertiary)] font-medium py-1">{w}</div>
            ))}
          </div>
          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((d, i) => {
              if (d === null) return <div key={`empty-${i}`} />;
              const dateStr = toDateStr(viewYear, viewMonth, d);
              const isSelected = value === dateStr;
              const isToday = todayStr === dateStr;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleSelect(d)}
                  className={`
                    h-8 w-full rounded-lg text-sm flex items-center justify-center transition-colors cursor-pointer outline-none focus:outline-none
                    ${isSelected
                      ? 'bg-[var(--accent)] text-white font-semibold'
                      : isToday
                        ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium'
                        : 'text-[var(--text-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]'
                    }
                  `}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`liquid-glass-input w-full px-3 ${py} text-sm text-left flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="flex items-center gap-2">
          <Calendar size={14} className="text-[var(--text-tertiary)] flex-shrink-0" />
          <span className={parsed ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}>
            {displayText}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={`text-[var(--text-tertiary)] transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {dropdownContent}
    </div>
  );
};
