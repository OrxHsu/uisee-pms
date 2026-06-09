import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Clock } from 'lucide-react';

interface LiquidTimePickerProps {
  value: string; // HH:mm
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export const LiquidTimePicker: React.FC<LiquidTimePickerProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '选择时间',
  disabled = false,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const parts = value.split(':');
  const currentHour = parts.length === 2 ? +parts[0] : -1;
  const currentMinute = parts.length === 2 ? +parts[1] : -1;
  const displayText = value || placeholder;

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const dropH = 280;
      const top =
        rect.bottom + 4 + dropH > viewportH
          ? rect.top - dropH - 4
          : rect.bottom + 4;
      setDropdownStyle({
        position: 'fixed',
        top,
        left: rect.left,
        width: Math.max(rect.width, 200),
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
      // Scroll to current selection
      requestAnimationFrame(() => {
        if (hourListRef.current && currentHour >= 0) {
          const target = hourListRef.current.querySelector(`[data-hour="${currentHour}"]`);
          if (target) target.scrollIntoView({ block: 'center' });
        }
        if (minuteListRef.current && currentMinute >= 0) {
          const target = minuteListRef.current.querySelector(`[data-minute="${currentMinute}"]`);
          if (target) target.scrollIntoView({ block: 'center' });
        }
      });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, handleClickOutside, updatePosition, currentHour, currentMinute]);

  const handleHourSelect = (h: number) => {
    const m = currentMinute >= 0 ? pad(currentMinute) : '00';
    onChange(`${pad(h)}:${m}`);
  };

  const handleMinuteSelect = (m: number) => {
    const h = currentHour >= 0 ? pad(currentHour) : '00';
    onChange(`${h}:${pad(m)}`);
  };

  const py = compact ? 'py-1.5' : 'py-2';

  // Generate hours (0-23) and minutes (0-59, step 5)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const dropdownContent = isOpen
    ? createPortal(
        <div ref={dropdownRef} style={dropdownStyle} className="liquid-glass-strong p-2">
          <div className="flex gap-2">
            {/* Hour column */}
            <div className="flex-1">
              <div className="text-center text-xs text-[var(--text-tertiary)] font-medium pb-1 border-b border-[var(--border-color)] mb-1">时</div>
              <div ref={hourListRef} className="max-h-48 overflow-y-auto space-y-0.5">
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    data-hour={h}
                    onClick={() => handleHourSelect(h)}
                    className={`
                      w-full text-center px-2 py-1 text-sm rounded-lg transition-colors cursor-pointer outline-none focus:outline-none
                      ${h === currentHour
                        ? 'bg-[var(--accent)] text-white font-medium'
                        : 'text-[var(--text-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]'
                      }
                    `}
                  >
                    {pad(h)}
                  </button>
                ))}
              </div>
            </div>
            {/* Separator */}
            <div className="flex items-center text-xl font-light text-[var(--text-tertiary)]">:</div>
            {/* Minute column */}
            <div className="flex-1">
              <div className="text-center text-xs text-[var(--text-tertiary)] font-medium pb-1 border-b border-[var(--border-color)] mb-1">分</div>
              <div ref={minuteListRef} className="max-h-48 overflow-y-auto space-y-0.5">
                {minutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    data-minute={m}
                    onClick={() => handleMinuteSelect(m)}
                    className={`
                      w-full text-center px-2 py-1 text-sm rounded-lg transition-colors cursor-pointer outline-none focus:outline-none
                      ${m === currentMinute
                        ? 'bg-[var(--accent)] text-white font-medium'
                        : 'text-[var(--text-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]'
                      }
                    `}
                  >
                    {pad(m)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Quick select: Now */}
          <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                onChange(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
                setIsOpen(false);
              }}
              className="w-full text-center text-sm text-[var(--accent)] hover:bg-[var(--accent-light)] py-1.5 rounded-lg transition-colors cursor-pointer font-medium"
            >
              当前时间
            </button>
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
          <Clock size={14} className="text-[var(--text-tertiary)] flex-shrink-0" />
          <span className={value ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}>
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
