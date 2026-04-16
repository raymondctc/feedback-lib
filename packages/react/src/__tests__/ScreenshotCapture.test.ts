import { describe, it, expect, vi } from 'vitest';
import { captureScreenshot } from '../ScreenshotCapture.js';

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toBlob: (cb: (blob: Blob | null) => void) => {
      cb(new Blob(['fake-png'], { type: 'image/png' }));
    },
  }),
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

  it('replaces lab() computed styles with #808080 so html2canvas does not choke', async () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    // Simulate a browser that returns lab() from getComputedStyle
    const original = window.getComputedStyle;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const base = original(el);
      return new Proxy(base, {
        get(target, p) {
          if (p === 'getPropertyValue') {
            return (prop: string) =>
              prop === 'color' ? 'lab(50% 20 -30)' : target.getPropertyValue(prop);
          }
          return typeof target[p as keyof typeof target] === 'function'
            ? (target[p as keyof typeof target] as Function).bind(target)
            : target[p as keyof typeof target];
        },
      });
    });

    await captureScreenshot(element);

    // The inline style should have been replaced with the fallback, not the lab() value
    expect(element.style.getPropertyValue('color')).not.toMatch(/lab\(/i);

    vi.restoreAllMocks();
    element.remove();
  });

  it('returns null when html2canvas throws', async () => {
    const { default: html2canvas } = await import('html2canvas');
    (html2canvas as any).mockRejectedValueOnce(new Error('render failed'));

    const element = document.createElement('div');
    document.body.appendChild(element);

    const result = await captureScreenshot(element);

    expect(result).toBeNull();

    element.remove();
  });
});