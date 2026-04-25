import { useState, useEffect, useRef } from 'react';
import { isDarkMode } from './CommentPopover.js';

interface MobileCommentSheetProps {
  element: HTMLElement;
  categories: readonly string[];
  onSubmit: (comment: string, category: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function MobileCommentSheet({
  element,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
}: MobileCommentSheetProps) {
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dark = isDarkMode();

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
        shadow: '0 -4px 16px rgba(0, 0, 0, 0.6)',
        backdrop: 'rgba(0, 0, 0, 0.6)',
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
        shadow: '0 -4px 12px rgba(0, 0, 0, 0.15)',
        backdrop: 'rgba(0, 0, 0, 0.4)',
      };

  useEffect(() => {
    // Focus textarea after slide-up animation
    const timer = setTimeout(() => {
      sheetRef.current?.querySelector('textarea')?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Stop propagation to avoid Radix / host-app interop issues
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const stop = (e: Event) => e.stopPropagation();
    const types = ['pointerdown', 'mousedown', 'touchstart', 'focusin', 'focusout'] as const;
    types.forEach((t) => el.addEventListener(t, stop));
    return () => types.forEach((t) => el.removeEventListener(t, stop));
  }, []);

  // FocusScope focusout workaround — same as CommentPopover
  useEffect(() => {
    const stopFocusOutForPopoverTarget = (e: FocusEvent) => {
      const next = e.relatedTarget;
      if (next instanceof Node && (next as HTMLElement).closest?.('[data-pinpoint-popover]')) {
        e.stopPropagation();
      }
    };
    document.body.addEventListener('focusout', stopFocusOutForPopoverTarget);
    return () => document.body.removeEventListener('focusout', stopFocusOutForPopoverTarget);
  }, []);

  const handleSubmit = () => {
    const trimmed = comment.trim();
    if (!trimmed) return;
    onSubmit(trimmed, category);
  };

  const label = `${element.tagName.toLowerCase()}${element.classList?.item(0) ? `.${element.classList.item(0)}` : ''}`;

  return (
    <div
      data-testid="pinpoint-mobile-sheet"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        pointerEvents: 'auto',
      }}
    >
      {/* Backdrop */}
      <div
        data-testid="pinpoint-mobile-backdrop"
        onClick={onCancel}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.backdrop,
        }}
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        data-pinpoint-overlay=""
        data-pinpoint-popover=""
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.bg,
          borderTop: `1px solid ${colors.border}`,
          borderRadius: '16px 16px 0 0',
          padding: '16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
          boxShadow: colors.shadow,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: colors.text,
          transform: 'translateY(0)',
          transition: 'transform 0.3s ease-out',
          zIndex: 999999,
          pointerEvents: 'auto',
        }}
      >
        {/* Handle bar */}
        <div
          style={{
            width: '36px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: dark ? '#48484a' : '#d1d5db',
            margin: '0 auto 12px',
          }}
        />

        {/* Element label pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: dark ? '#2c2c2e' : '#f3f4f6',
            border: `1px solid ${colors.border}`,
            borderRadius: '999px',
            padding: '4px 10px',
            fontSize: '12px',
            fontFamily: 'monospace',
            marginBottom: '12px',
            color: colors.text,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'inline-block',
            }}
          />
          {label}
        </div>

        <textarea
          placeholder="Describe the issue..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
          disabled={isSubmitting}
          style={{
            width: '100%',
            minHeight: '96px',
            border: `1px solid ${colors.inputBorder}`,
            borderRadius: '8px',
            padding: '12px',
            fontSize: '16px', // 16px prevents iOS zoom
            resize: 'vertical',
            boxSizing: 'border-box',
            backgroundColor: colors.inputBg,
            color: colors.text,
            marginBottom: '12px',
          }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          role="combobox"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1px solid ${colors.inputBorder}`,
            borderRadius: '8px',
            fontSize: '16px',
            backgroundColor: colors.inputBg,
            color: colors.text,
            marginBottom: '16px',
          }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSubmit}
            disabled={!comment.trim() || isSubmitting}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: comment.trim() && !isSubmitting ? '#3b82f6' : dark ? '#48484a' : '#9ca3af',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: comment.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 500,
              minHeight: '48px',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
              padding: '12px 24px',
              backgroundColor: colors.cancelBg,
              border: `1px solid ${colors.cancelBorder}`,
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 500,
              color: colors.cancelText,
              minHeight: '48px',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
