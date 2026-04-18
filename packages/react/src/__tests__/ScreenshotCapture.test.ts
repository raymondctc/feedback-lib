import { describe, it, expect, vi } from 'vitest';
import { captureScreenshot } from '../ScreenshotCapture.js';

vi.mock('html2canvas-pro', () => ({
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

  it('returns null when html2canvas-pro throws', async () => {
    const { default: html2canvas } = await import('html2canvas-pro');
    (html2canvas as any).mockRejectedValueOnce(new Error('render failed'));

    const element = document.createElement('div');
    document.body.appendChild(element);

    const result = await captureScreenshot(element);

    expect(result).toBeNull();

    element.remove();
  });

  it('passes the clicked element to html2canvas (not document.body)', async () => {
    const { default: html2canvas } = await import('html2canvas-pro');
    const element = document.createElement('div');
    document.body.appendChild(element);

    await captureScreenshot(element);

    expect(html2canvas).toHaveBeenCalledWith(element, expect.objectContaining({
      useCORS: true,
    }));

    element.remove();
  });

  it('uses resolved page background instead of null', async () => {
    const { default: html2canvas } = await import('html2canvas-pro');
    const element = document.createElement('div');
    document.body.appendChild(element);

    await captureScreenshot(element);

    // backgroundColor should be a computed value (string) or undefined,
    // never null — null would make html2canvas use a transparent canvas
    // which shows as white/grey on dark-themed sites.
    const callArgs = (html2canvas as any).mock.calls.at(-1);
    const options = callArgs[1];
    expect(options.backgroundColor).not.toBe(null);

    element.remove();
  });

  it('strips pinpoint overlays from cloned document via onclone', async () => {
    const { default: html2canvas } = await import('html2canvas-pro');
    const element = document.createElement('div');
    document.body.appendChild(element);

    await captureScreenshot(element);

    const callArgs = (html2canvas as any).mock.calls.at(-1);
    const options = callArgs[1];
    expect(options.onclone).toBeInstanceOf(Function);

    element.remove();
  });
});