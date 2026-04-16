import { useState, useEffect, useRef } from 'react';

interface CommentPopoverProps {
  anchorRect: DOMRect;
  categories: readonly string[];
  onSubmit: (comment: string, category: string) => void;
  onCancel: () => void;
}

export function isDarkMode(): boolean {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return true;
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return true;
  }
  return false;
}

export function CommentPopover({
  anchorRect,
  categories,
  onSubmit,
  onCancel,
}: CommentPopoverProps) {
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const popoverRef = useRef<HTMLDivElement>(null);
  const dark = isDarkMode();

  const position = getPosition(anchorRect);

  const colors = dark
    ? {
        bg: '#1c1c1e',
        border: '#3a3a3c',
        text: '#f5f5f7',
        inputBg: '#2c2c2e',
        inputBorder: '#48484a',
        placeholder: '#8e8e93',
        cancelBg: '#2c2c2e',
        cancelBorder: '#48484a',
        cancelText: '#f5f5f7',
        shadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
      }
    : {
        bg: '#fff',
        border: '#e5e7eb',
        text: '#111827',
        inputBg: '#fff',
        inputBorder: '#d1d5db',
        placeholder: '#9ca3af',
        cancelBg: '#f3f4f6',
        cancelBorder: '#d1d5db',
        cancelText: '#374151',
        shadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      };

  useEffect(() => {
    popoverRef.current?.querySelector('textarea')?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = comment.trim();
    if (!trimmed) return;
    onSubmit(trimmed, category);
  };

  return (
    <div
      ref={popoverRef}
      data-feedback-overlay=""
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 999999,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px',
        boxShadow: colors.shadow,
        width: '320px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: colors.text,
      }}
    >
      <textarea
        placeholder="Describe the issue..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={2000}
        style={{
          width: '100%',
          minHeight: '80px',
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: '4px',
          padding: '8px',
          fontSize: '14px',
          resize: 'vertical',
          boxSizing: 'border-box',
          backgroundColor: colors.inputBg,
          color: colors.text,
        }}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        role="combobox"
        style={{
          width: '100%',
          marginTop: '8px',
          padding: '6px',
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: '4px',
          fontSize: '14px',
          backgroundColor: colors.inputBg,
          color: colors.text,
        }}
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </option>
        ))}
      </select>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          onClick={handleSubmit}
          disabled={!comment.trim()}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: comment.trim() ? '#3b82f6' : (dark ? '#48484a' : '#9ca3af'),
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: comment.trim() ? 'pointer' : 'not-allowed',
            fontSize: '14px',
          }}
        >
          Submit
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            backgroundColor: colors.cancelBg,
            border: `1px solid ${colors.cancelBorder}`,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            color: colors.cancelText,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function getPosition(anchorRect: DOMRect): { top: number; left: number } {
  const popoverWidth = 320;
  const popoverHeight = 240;
  const margin = 8;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Prefer below the element; flip above if it overflows
  const spaceBelow = viewportHeight - anchorRect.bottom - margin;
  const spaceAbove = anchorRect.top - margin;
  let top: number;
  if (spaceBelow >= popoverHeight) {
    top = anchorRect.bottom + margin;
  } else if (spaceAbove >= popoverHeight) {
    top = anchorRect.top - popoverHeight - margin;
  } else {
    // Neither fits fully — pick whichever side has more room and clamp
    top = spaceBelow >= spaceAbove
      ? anchorRect.bottom + margin
      : anchorRect.top - popoverHeight - margin;
  }

  // Clamp top so popover stays within viewport
  top = Math.max(margin, Math.min(top, viewportHeight - popoverHeight - margin));

  // Horizontal: align to element left edge, shift if overflowing
  let left = anchorRect.left;
  if (left + popoverWidth > viewportWidth - margin) {
    left = viewportWidth - popoverWidth - margin;
  }
  if (left < margin) {
    left = margin;
  }

  return { top, left };
}