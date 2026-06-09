import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

interface LiquidSelectOption {
  value: string;
  label: string;
}

interface LiquidSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: LiquidSelectOption[];
  className?: string;
  buttonClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
}

export const LiquidSelect: React.FC<LiquidSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  buttonClassName = '',
  placeholder,
  disabled = false,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder || '请选择';

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const dropH = Math.min(options.length * 36 + 8, 240);
      const top =
        rect.bottom + 4 + dropH > viewportH
          ? rect.top - dropH - 4
          : rect.bottom + 4;
      setDropdownStyle({
        position: 'fixed',
        top,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [options.length]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Node;
    if (
      triggerRef.current &&
      !triggerRef.current.contains(target) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(target)
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

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const py = compact ? 'py-1.5' : 'py-2';

  const dropdownContent = isOpen
    ? createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="liquid-glass-strong p-1 max-h-60 overflow-y-auto"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer outline-none focus:outline-none ${
                opt.value === value
                  ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium'
                  : 'text-[var(--text-primary)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
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
        className={`liquid-glass-input w-full px-3 ${py} text-sm text-left flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <span
          className={
            selectedOption
              ? 'text-[var(--text-primary)]'
              : 'text-[var(--text-tertiary)]'
          }
        >
          {displayText}
        </span>
        <ChevronDown
          size={14}
          className={`text-[var(--text-tertiary)] transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {dropdownContent}
    </div>
  );
};
