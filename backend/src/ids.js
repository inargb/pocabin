import crypto from 'node:crypto';

/* URL-safe random id (16 chars, ~96 bits). */
export const newId = () => crypto.randomBytes(12).toString('base64url');
