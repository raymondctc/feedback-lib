import { describe, it, expect } from 'vitest';
import { generateSelector } from '../selectors.js';

describe('generateSelector', () => {
  it('returns tag name for body', () => {
    const el = { tagName: 'BODY' } as HTMLElement;
    expect(generateSelector(el)).toBe('body');
  });

  it('returns id selector when element has id', () => {
    const el = document.createElement('div');
    el.id = 'main';
    expect(generateSelector(el)).toBe('#main');
  });

  it('returns tag with class for elements with classes', () => {
    const el = document.createElement('button');
    el.className = 'cta-btn';
    document.body.appendChild(el);
    const result = generateSelector(el);
    expect(result).toBe('button.cta-btn');
    el.remove();
  });

  it('handles elements without id or class', () => {
    const el = document.createElement('span');
    document.body.appendChild(el);
    const result = generateSelector(el);
    expect(result).toBe('span');
    el.remove();
  });
});