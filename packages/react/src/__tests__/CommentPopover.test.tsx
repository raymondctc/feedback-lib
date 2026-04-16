import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommentPopover } from '../CommentPopover.js';

describe('CommentPopover', () => {
  const defaultProps = {
    anchorRect: new DOMRect(100, 200, 150, 40),
    categories: ['bug', 'suggestion', 'question', 'other'] as const,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders a textarea and category dropdown', () => {
    render(<CommentPopover {...defaultProps} />);

    expect(screen.getByPlaceholderText(/describe/i)).toBeDefined();
    expect(screen.getByRole('combobox')).toBeDefined();
  });

  it('calls onCancel when cancel is clicked', () => {
    render(<CommentPopover {...defaultProps} />);

    fireEvent.click(screen.getByText(/cancel/i));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('calls onSubmit with comment and category', () => {
    render(<CommentPopover {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(/describe/i);
    fireEvent.change(textarea, { target: { value: 'Button not working' } });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'bug' } });

    fireEvent.click(screen.getByText(/submit/i));
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(
      'Button not working',
      'bug',
    );
  });
});