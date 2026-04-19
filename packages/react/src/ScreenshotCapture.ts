import { domToBlob } from 'modern-screenshot';
import type { Options } from 'modern-screenshot';

/**
 * Resolve the effective background colour of the page by checking
 * <html> and <body>. Returns the first non-transparent colour found,
 * or null if both are transparent (modern-screenshot will render a
 * transparent background).
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

    const options: Options = {
      scale: window.devicePixelRatio || 1,
      backgroundColor: bgColor ?? null,
      // Exclude Pinpoint UI overlays from the screenshot by filtering
      // them out before cloning. Returning false prevents the node and
      // its children from appearing in the capture.
      filter: (node) => {
        if (node instanceof HTMLElement) {
          if (
            node.hasAttribute('data-pinpoint-overlay') ||
            node.hasAttribute('data-pinpoint-popover')
          ) {
            return false;
          }
        }
        return true;
      },
    };

    const blob = await domToBlob(element, options);
    return blob;
  } catch (error) {
    console.error('[Pinpoint] Screenshot capture failed:', error);
    return null;
  }
}