import { describe, it, expect } from 'vitest';
import {
  COMPUTED_STYLES_WHITELIST,
  MAX_DOM_DEPTH,
  MAX_SNAPSHOT_SIZE,
  MAX_COMMENT_LENGTH,
  MIN_ELEMENT_SIZE,
  DEFAULT_CATEGORIES,
} from '../types.js';

describe('Constants', () => {
  it('COMPUTED_STYLES_WHITELIST has 22 items', () => {
    expect(COMPUTED_STYLES_WHITELIST).toHaveLength(22);
  });

  it('MAX_DOM_DEPTH is 5', () => {
    expect(MAX_DOM_DEPTH).toBe(5);
  });

  it('MAX_SNAPSHOT_SIZE is 500000', () => {
    expect(MAX_SNAPSHOT_SIZE).toBe(500_000);
  });

  it('MAX_COMMENT_LENGTH is 2000', () => {
    expect(MAX_COMMENT_LENGTH).toBe(2000);
  });

  it('MIN_ELEMENT_SIZE is 10', () => {
    expect(MIN_ELEMENT_SIZE).toBe(10);
  });

  it('DEFAULT_CATEGORIES equals the expected array', () => {
    expect(DEFAULT_CATEGORIES).toEqual(['bug', 'suggestion', 'question', 'other']);
  });
});