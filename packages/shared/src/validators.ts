import {
  MAX_COMMENT_LENGTH,
  MAX_SNAPSHOT_SIZE,
  DEFAULT_CATEGORIES,
} from './types.js';
import type { FeedbackMetadata, DOMSnapshotNode, FeedbackCategory, CaptureMethod } from './types.js';

// --- Validation Result Types ---

export interface ValidResult<T> {
  valid: true;
  data: T;
}

export interface InvalidResult {
  valid: false;
  error: string;
}

export type ValidationResult<T> = ValidResult<T> | InvalidResult;

// --- Valid Sets ---

const VALID_CATEGORIES = new Set<string>(DEFAULT_CATEGORIES);
const VALID_CAPTURE_METHODS = new Set<string>(['html2canvas', 'native']);

// --- Validators ---

export function validateComment(comment: unknown): ValidationResult<string> {
  if (typeof comment !== 'string') {
    return { valid: false, error: 'Comment must be a string' };
  }

  if (comment.trim().length === 0) {
    return { valid: false, error: 'Comment must not be empty or whitespace-only' };
  }

  if (comment.length > MAX_COMMENT_LENGTH) {
    return { valid: false, error: `Comment exceeds maximum length of ${MAX_COMMENT_LENGTH} characters` };
  }

  return { valid: true, data: comment };
}

export function validateFeedbackMetadata(metadata: unknown): ValidationResult<FeedbackMetadata> {
  if (typeof metadata !== 'object' || metadata === null) {
    return { valid: false, error: 'Metadata must be an object' };
  }

  const obj = metadata as Record<string, unknown>;

  if (typeof obj.projectId !== 'string' || obj.projectId.trim().length === 0) {
    return { valid: false, error: 'projectId is required and must be a non-empty string' };
  }

  const commentResult = validateComment(obj.comment);
  if (!commentResult.valid) {
    return { valid: false, error: `Invalid comment: ${commentResult.error}` };
  }

  if (obj.category !== null && !VALID_CATEGORIES.has(obj.category as string)) {
    return { valid: false, error: `Invalid category. Must be one of: ${DEFAULT_CATEGORIES.join(', ')}` };
  }

  if (!VALID_CAPTURE_METHODS.has(obj.captureMethod as string)) {
    return { valid: false, error: 'Invalid captureMethod. Must be one of: html2canvas, native' };
  }

  const data: FeedbackMetadata = {
    projectId: obj.projectId as string,
    comment: commentResult.data,
    category: (obj.category as FeedbackCategory | null) ?? null,
    selector: obj.selector as string,
    url: obj.url as string,
    viewportWidth: obj.viewportWidth as number,
    viewportHeight: obj.viewportHeight as number,
    userAgent: obj.userAgent as string,
    captureMethod: obj.captureMethod as CaptureMethod,
  };

  return { valid: true, data };
}

export function validateDOMSnapshot(node: unknown): ValidationResult<DOMSnapshotNode> {
  if (typeof node !== 'object' || node === null) {
    return { valid: false, error: 'DOM snapshot must be an object' };
  }

  const obj = node as Record<string, unknown>;

  if (typeof obj.tagName !== 'string') {
    return { valid: false, error: 'DOM snapshot must have a tagName string' };
  }

  const serialized = JSON.stringify(node);
  if (serialized.length > MAX_SNAPSHOT_SIZE) {
    return { valid: false, error: `DOM snapshot exceeds maximum size of ${MAX_SNAPSHOT_SIZE} bytes when serialized` };
  }

  return { valid: true, data: node as DOMSnapshotNode };
}