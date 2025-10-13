import crypto from 'crypto';

export const generateSecureToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
