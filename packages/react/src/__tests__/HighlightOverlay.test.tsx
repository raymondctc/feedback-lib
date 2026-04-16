import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackProvider, useFeedback } from '../FeedbackProvider.js';

function TestPage() {
  const { isActive, toggle } = useFeedback();
  return (
    <div>
      <button onClick={toggle} data-testid="toggle">
        {isActive ? 'Active' : 'Inactive'}
      </button>
      <div data-testid="target" style={{ width: 100, height: 100 }}>
        Target
      </div>
    </div>
  );
}

describe('HighlightOverlay', () => {
  it('renders overlay container when active', () => {
    render(
      <FeedbackProvider endpoint="https://test.dev" projectId="test">
        <TestPage />
      </FeedbackProvider>,
    );

    fireEvent.click(screen.getByTestId('toggle'));

    const overlay = screen.getByTestId('feedback-overlay');
    expect(overlay).toBeDefined();
  });

  it('does not render overlay when inactive', () => {
    render(
      <FeedbackProvider endpoint="https://test.dev" projectId="test">
        <TestPage />
      </FeedbackProvider>,
    );

    expect(screen.queryByTestId('feedback-overlay')).toBeNull();
  });

  it('excludes elements matching exclude prop', () => {
    render(
      <FeedbackProvider
        endpoint="https://test.dev"
        projectId="test"
        exclude={['[data-testid="target"]']}
      >
        <TestPage />
      </FeedbackProvider>,
    );

    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('feedback-overlay')).toBeDefined();
  });

  it('skips overlay elements with data-feedback-overlay attribute', () => {
    render(
      <FeedbackProvider endpoint="https://test.dev" projectId="test">
        <TestPage />
      </FeedbackProvider>,
    );

    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('feedback-overlay')).toBeDefined();
  });
});