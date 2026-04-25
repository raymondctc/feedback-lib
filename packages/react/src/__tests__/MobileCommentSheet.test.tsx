import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileCommentSheet } from '../MobileCommentSheet.js';

describe('MobileCommentSheet', () => {
  const defaultProps = {
    element: Object.assign(document.createElement('div'), {
      className: 'card',
    }),
    categories: ['bug', 'suggestion', 'question', 'other'] as const,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders element label pill', () => {
    render(<MobileCommentSheet {...defaultProps} />);
    expect(screen.getByText('div.card')).toBeDefined();
  });

  it('renders textarea and category select', () => {
    render(<MobileCommentSheet {...defaultProps} />);
    expect(screen.getByPlaceholderText('Describe the issue...')).toBeDefined();
    expect(screen.getByRole('combobox')).toBeDefined();
  });

  it('disables submit when comment is empty', () => {
    render(<MobileCommentSheet {...defaultProps} />);
    const submitBtn = screen.getByRole('button', { name: 'Submit' }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });

  it('calls onSubmit with comment and category', () => {
    render(<MobileCommentSheet {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Describe the issue...');
    fireEvent.change(textarea, { target: { value: 'Something is broken' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(defaultProps.onSubmit).toHaveBeenCalledWith('Something is broken', 'bug');
  });

  it('calls onCancel when Cancel clicked', () => {
    render(<MobileCommentSheet {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('calls onCancel when backdrop tapped', () => {
    render(<MobileCommentSheet {...defaultProps} />);
    fireEvent.click(screen.getByTestId('pinpoint-mobile-backdrop'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('has data-pinpoint-overlay and data-pinpoint-popover attributes', () => {
    render(<MobileCommentSheet {...defaultProps} />);
    const sheet = screen.getByTestId('pinpoint-mobile-sheet');
    expect(sheet.querySelector('[data-pinpoint-overlay]')).toBeDefined();
    expect(sheet.querySelector('[data-pinpoint-popover]')).toBeDefined();
  });

  it('shows submitting state', () => {
    render(<MobileCommentSheet {...defaultProps} isSubmitting={true} />);
    expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDefined();
    const submitBtn = screen.getByRole('button', { name: 'Submitting...' }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' }) as HTMLButtonElement;
    expect(cancelBtn.disabled).toBe(true);
    const textarea = screen.getByPlaceholderText('Describe the issue...') as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
  });

  it('trims comment before submitting', () => {
    render(<MobileCommentSheet {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Describe the issue...') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '  ' } });
    const submitBtn = screen.getByRole('button', { name: 'Submit' }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });
});
