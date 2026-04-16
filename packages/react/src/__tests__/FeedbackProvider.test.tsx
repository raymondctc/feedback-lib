import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackProvider, useFeedback } from '../FeedbackProvider.js';

function TestComponent() {
  const { isActive, toggle } = useFeedback();
  return (
    <button onClick={toggle} data-testid="toggle">
      {isActive ? 'Active' : 'Inactive'}
    </button>
  );
}

describe('FeedbackProvider', () => {
  it('renders children', () => {
    render(
      <FeedbackProvider endpoint="https://test.dev" projectId="test">
        <div data-testid="child">Hello</div>
      </FeedbackProvider>,
    );
    expect(screen.getByTestId('child')).toBeDefined();
  });

  it('starts in inactive mode', () => {
    render(
      <FeedbackProvider endpoint="https://test.dev" projectId="test">
        <TestComponent />
      </FeedbackProvider>,
    );
    expect(screen.getByTestId('toggle').textContent).toBe('Inactive');
  });

  it('toggles to active mode', () => {
    render(
      <FeedbackProvider endpoint="https://test.dev" projectId="test">
        <TestComponent />
      </FeedbackProvider>,
    );
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('toggle').textContent).toBe('Active');
  });

  it('throws if useFeedback is used outside FeedbackProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow();
    spy.mockRestore();
  });
});