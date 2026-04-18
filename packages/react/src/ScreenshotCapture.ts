import html2canvas from 'html2canvas-pro';

/**
 * Resolve the effective background colour of the page by checking
 * <html> and <body>. Returns the first non-transparent colour found,
 * or null if both are transparent (html2canvas will fall back to its
 * default white fill).
 */
function resolvePageBackground(): string | null {
  for (const el of [document.documentElement, document.body]) {
    const bg = window.getComputedStyle(el).backgroundColor;
    // "transparent", "rgba(0,0,0,0)", and empty all mean "nothing painted here"
    if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
      return bg;
    }
  }
  return null;
}

export async function captureScreenshot(
  element: HTMLElement,
): Promise<Blob | null> {
  try {
    // Resolve the page's rendered background so that elements which
    // visually inherit their colour from <html>/<body> (common on
    // dark-themed sites) appear correctly in the screenshot rather than
    // on a white/grey canvas.
    const bgColor = resolvePageBackground();

    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: bgColor ?? undefined,
      scale: window.devicePixelRatio || 1,
      // Strip Pinpoint overlays from the cloned document so they never
      // appear in the screenshot (safety net for when the captured
      // element is a high-level ancestor that contains the React root).
      onclone: (_doc, clonedDoc) => {
        clonedDoc
          .querySelectorAll('[data-pinpoint-overlay], [data-pinpoint-popover]')
          .forEach((el) => el.remove());
      },
    });

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/png',
        1.0,
      );
    });
  } catch (error) {
    console.error('[Pinpoint] Screenshot capture failed:', error);
    return null;
  }
}