import { describe, it, expect } from 'vitest';
import {
  validateComment,
  validateFeedbackMetadata,
  validateDOMSnapshot,
} from '../validators.js';
import {
  MAX_COMMENT_LENGTH,
  MAX_SNAPSHOT_SIZE,
  DEFAULT_CATEGORIES,
} from '../types.js';
import type { FeedbackCategory, CaptureMethod } from '../types.js';

// --- validateComment ---

describe('validateComment', () => {
  it('accepts a valid comment', () => {
    const result = validateComment('This is a bug report');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data).toBe('This is a bug report');
    }
  });

  it('rejects empty string', () => {
    const result = validateComment('');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBeDefined();
    }
  });

  it('rejects whitespace-only string', () => {
    const result = validateComment('   \t\n  ');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBeDefined();
    }
  });

  it('rejects comment exceeding MAX_COMMENT_LENGTH', () => {
    const result = validateComment('a'.repeat(MAX_COMMENT_LENGTH + 1));
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBeDefined();
    }
  });

  it('accepts comment exactly at MAX_COMMENT_LENGTH', () => {
    const result = validateComment('a'.repeat(MAX_COMMENT_LENGTH));
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data).toBe('a'.repeat(MAX_COMMENT_LENGTH));
    }
  });

  it('rejects non-string input', () => {
    const result = validateComment(123 as unknown as string);
    expect(result.valid).toBe(false);
  });
});

// --- validateFeedbackMetadata ---

describe('validateFeedbackMetadata', () => {
  const validMetadata = {
    projectId: 'proj_abc',
    comment: 'Something is broken',
    category: 'bug' as FeedbackCategory,
    selector: '#submit-btn',
    url: 'https://example.com',
    viewportWidth: 1440,
    viewportHeight: 900,
    userAgent: 'Mozilla/5.0',
    captureMethod: 'native' as CaptureMethod,
  };

  it('accepts valid metadata', () => {
    const result = validateFeedbackMetadata(validMetadata);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.projectId).toBe('proj_abc');
      expect(result.data.comment).toBe('Something is broken');
    }
  });

  it('rejects missing projectId', () => {
    const { projectId: _, ...withoutProjectId } = validMetadata;
    const result = validateFeedbackMetadata(withoutProjectId);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBeDefined();
    }
  });

  it('rejects invalid category', () => {
    const result = validateFeedbackMetadata({
      ...validMetadata,
      category: 'invalid_category',
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBeDefined();
    }
  });

  it('rejects invalid captureMethod', () => {
    const result = validateFeedbackMetadata({
      ...validMetadata,
      captureMethod: 'screenshot_magic',
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBeDefined();
    }
  });

  it('accepts null category', () => {
    const result = validateFeedbackMetadata({
      ...validMetadata,
      category: null,
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.category).toBeNull();
    }
  });

  it('rejects invalid comment via nested validateComment', () => {
    const result = validateFeedbackMetadata({
      ...validMetadata,
      comment: '',
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBeDefined();
    }
  });

  it('rejects non-object input', () => {
    const result = validateFeedbackMetadata('not an object');
    expect(result.valid).toBe(false);
  });
});

// --- validateDOMSnapshot ---

describe('validateDOMSnapshot', () => {
  const validNode = {
    tagName: 'DIV',
    selector: 'div.container',
    textContent: null,
    attributes: {},
    computedStyles: {},
    boundingRect: { x: 0, y: 0, width: 100, height: 50 },
    children: [],
  };

  it('accepts valid snapshot', () => {
    const result = validateDOMSnapshot(validNode);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.tagName).toBe('DIV');
    }
  });

  it('rejects snapshot exceeding MAX_SNAPSHOT_SIZE when serialized', () => {
    // Create a node that serializes to > MAX_SNAPSHOT_SIZE
    const oversizedNode = {
      ...validNode,
      textContent: 'x'.repeat(MAX_SNAPSHOT_SIZE + 1),
    };
    const result = validateDOMSnapshot(oversizedNode);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBeDefined();
    }
  });

  it('rejects snapshot without tagName', () => {
    const { tagName: _, ...withoutTagName } = validNode;
    const result = validateDOMSnapshot(withoutTagName);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBeDefined();
    }
  });

  it('rejects non-object input', () => {
    const result = validateDOMSnapshot(42);
    expect(result.valid).toBe(false);
  });
});