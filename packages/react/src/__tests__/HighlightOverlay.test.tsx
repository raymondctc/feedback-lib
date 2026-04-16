import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HighlightOverlay } from '../HighlightOverlay.js';
import type { FeedbackProviderConfig } from '@feedback/shared';

const defaultConfig: FeedbackProviderConfig = {
  endpoint: 'https://test.dev/api/v1/feedback',
  projectId: 'test',
  categories: ['bug', 'suggestion', 'question', 'other'],
  captureMethod: 'html2canvas',
  theme: 'auto',
  exclude: undefined,
};

describe('HighlightOverlay', () => {
  it('renders overlay when an element is selected', () => {
    const element = document.createElement('div');
    element.classList.add('my-class');
    const rect = new DOMRect(10, 20, 200, 100);

    render(
      <HighlightOverlay
        config={defaultConfig}
        onElementSelect={vi.fn()}
        selectedElement={element}
        selectedRect={rect}
      />,
    );

    const overlay = screen.getByTestId('feedback-overlay');
    expect(overlay).toBeDefined();
    // Shows tag name and class
    expect(overlay.textContent).toContain('div.my-class');
  });

  it('renders nothing when no element is highlighted or selected', () => {
    render(
      <HighlightOverlay
        config={defaultConfig}
        onElementSelect={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('feedback-overlay')).toBeNull();
  });

  it('shows green border when element is selected', () => {
    const element = document.createElement('span');
    const rect = new DOMRect(50, 60, 300, 150);

    render(
      <HighlightOverlay
        config={defaultConfig}
        onElementSelect={vi.fn()}
        selectedElement={element}
        selectedRect={rect}
      />,
    );

    const overlay = screen.getByTestId('feedback-overlay');
    // Selected state should not show "Double-click to select" hint
    expect(overlay.textContent).not.toContain('Double-click to select');
    // Shows element tag
    expect(overlay.textContent).toContain('span');
  });
});