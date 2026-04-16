import html2canvas from 'html2canvas';

const UNSUPPORTED_COLOR_RE = /(lab|oklch|lch|oklab)\s*\(/i;

const COLOR_PROPERTIES = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'text-decoration-color',
  'caret-color',
  'fill',
  'stroke',
];

function temporarilySanitizeStylesheets(): () => void {
  const changes: Array<{ style: CSSStyleDeclaration; prop: string; original: string }> = [];

  function processRules(rules: CSSRuleList | null) {
    if (!rules) return;
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if ('cssRules' in rule && (rule as any).cssRules) {
        processRules((rule as any).cssRules);
      }
      if ('style' in rule && (rule as any).style) {
        const style = (rule as any).style as CSSStyleDeclaration;
        for (let j = 0; j < style.length; j++) {
          const prop = style[j];
          const value = style.getPropertyValue(prop);
          if (UNSUPPORTED_COLOR_RE.test(value)) {
            changes.push({ style, prop, original: value });
            style.setProperty(prop, '#808080');
          }
        }
      }
    }
  }

  for (const sheet of document.styleSheets) {
    try {
      processRules(sheet.cssRules);
    } catch {
      // Cross-origin stylesheet, skip
    }
  }

  return () => {
    for (const { style, prop, original } of changes) {
      try {
        style.setProperty(prop, original);
      } catch {}
    }
  };
}

function setInlineColorOverrides(element: HTMLElement): () => void {
  const overrides: Array<{ el: HTMLElement; prop: string; hadValue: boolean; original: string }> = [];
  // html2canvas traverses ancestors too, so we must patch the entire document
  const elements = Array.from(document.querySelectorAll('*')) as HTMLElement[];

  for (const el of elements) {
    const computed = window.getComputedStyle(el);
    for (const prop of COLOR_PROPERTIES) {
      const computedValue = computed.getPropertyValue(prop);
      if (!computedValue) continue;
      const hadValue = el.style.getPropertyValue(prop).length > 0;
      const original = hadValue ? el.style.getPropertyValue(prop) : '';
      overrides.push({ el, prop, hadValue, original });
      el.style.setProperty(prop, UNSUPPORTED_COLOR_RE.test(computedValue) ? '#808080' : computedValue);
    }
  }

  return () => {
    for (const { el, prop, hadValue, original } of overrides) {
      try {
        if (hadValue) {
          el.style.setProperty(prop, original);
        } else {
          el.style.removeProperty(prop);
        }
      } catch {}
    }
  };
}

export async function captureScreenshot(
  element: HTMLElement,
): Promise<Blob | null> {
  // html2canvas can't parse modern CSS color functions (lab, oklch, etc.).
  // Fix: temporarily replace them in stylesheets + set inline rgb() overrides
  // from getComputedStyle (which always returns rgb() format).
  const restoreStylesheets = temporarilySanitizeStylesheets();
  const restoreInlineStyles = setInlineColorOverrides(element);

  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      scale: window.devicePixelRatio || 1,
    });

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/png',
        1.0,
      );
    });
  } catch (error) {
    console.error('[Feedback] Screenshot capture failed:', error);
    return null;
  } finally {
    restoreInlineStyles();
    restoreStylesheets();
  }
}