import { describe, it, expect, vi } from 'vitest';
import { captureScreenshot } from '../ScreenshotCapture.js';

vi.mock('modern-screenshot', () => ({
  domToBlob: vi.fn().mockResolvedValue(new Blob(['fake-png'], { type: 'image/png' })),
}));

describe('captureScreenshot', () => {
  it('returns a PNG blob on success', async () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const result = await captureScreenshot(element);

    expect(result).toBeDefined();
    expect(result!.type).toBe('image/png');

    element.remove();
  });

  it('returns null when domToBlob throws', async () => {
    const { domToBlob } = await import('modern-screenshot');
    (domToBlob as any).mockRejectedValueOnce(new Error('render failed'));

    const element = document.createElement('div');
    document.body.appendChild(element);

    const result = await captureScreenshot(element);

    expect(result).toBeNull();

    element.remove();
  });

  it('passes the clicked element to domToBlob (not document.body)', async () => {
    const { domToBlob } = await import('modern-screenshot');
    const element = document.createElement('div');
    document.body.appendChild(element);

    await captureScreenshot(element);

    expect(domToBlob).toHaveBeenCalledWith(element, expect.objectContaining({
      scale: expect.any(Number),
    }));

    element.remove();
  });

  it('uses resolved page background instead of null', async () => {
    const { domToBlob } = await import('modern-screenshot');
    const element = document.createElement('div');
    document.body.appendChild(element);

    await captureScreenshot(element);

    // backgroundColor should be a computed value (string) or null,
    // never undefined — null means "transparent" in modern-screenshot.
    const callArgs = (domToBlob as any).mock.calls.at(-1);
    const options = callArgs[1];
    expect(options.backgroundColor).not.toBeUndefined();

    element.remove();
  });

  it('passes a filter function that excludes pinpoint overlays', async () => {
    const { domToBlob } = await import('modern-screenshot');
    const element = document.createElement('div');
    document.body.appendChild(element);

    await captureScreenshot(element);

    const callArgs = (domToBlob as any).mock.calls.at(-1);
    const options = callArgs[1];
    expect(options.filter).toBeInstanceOf(Function);

    // Verify the filter excludes overlay and popover nodes
    const overlayEl = document.createElement('div');
    overlayEl.setAttribute('data-pinpoint-overlay', '');
    expect(options.filter(overlayEl)).toBe(false);

    const popoverEl = document.createElement('div');
    popoverEl.setAttribute('data-pinpoint-popover', '');
    expect(options.filter(popoverEl)).toBe(false);

    const normalEl = document.createElement('div');
    expect(options.filter(normalEl)).toBe(true);

    element.remove();
  });
});