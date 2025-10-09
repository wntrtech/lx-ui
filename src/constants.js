/**
 * MIME types used in the application.
 * @enum {string}
 */
export const MIME_TYPES = Object.freeze({
  PDF: 'application/pdf',
  ZIP: 'application/zip',
  XML: 'application/xml',
  Binary: 'application/octet-stream',
  Image: 'image/*',
});

/**
 * Constants for out-of-range event types.
 * @enum {string}
 */
export const DATE_VALIDATION_RESULT = Object.freeze({
  /** Value is too early (before the minimum allowed) */
  OUT_OF_RANGE_MIN: 'OUT_OF_RANGE_MIN',
  /** Value is too late (exceeds allowed period) */
  OUT_OF_RANGE_MAX: 'OUT_OF_RANGE_MAX',
  /** Value is within allowed range */
  VALID: 'VALID',
  /** Value to check has not been received */
  NO_VALUE: 'NO_VALUE',
});
