const crypto = require('crypto');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-alugaki-key-1234';

/**
 * Hash password using PBKDF2 SHA-256
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password using PBKDF2 SHA-256, with fallback for seeded plain-text passwords
 */
function verifyPassword(password, storedPassword) {
  if (!storedPassword) return false;

  if (!storedPassword.includes(':')) {
    return password === storedPassword;
  }

  const [salt, hash] = storedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return hash === verifyHash;
}

/**
 * Generate cryptographically signed token (HMAC SHA-256)
 */
function generateToken(userId, role = 'user') {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const data = `${userId}:${role}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
  return `secure-token-${data}-${signature}`;
}

/**
 * Verify signed token and return user payload if valid
 */
function verifyToken(token) {
  if (!token || !token.startsWith('secure-token-')) {
    return null;
  }

  try {
    const payload = token.slice('secure-token-'.length);
    const lastDashIndex = payload.lastIndexOf('-');
    if (lastDashIndex <= 0) return null;

    const data = payload.slice(0, lastDashIndex);
    const signature = payload.slice(lastDashIndex + 1);
    const dataParts = data.split(':');

    if (dataParts.length === 2) {
      const [userId, expiresAt] = dataParts;
      const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
      if (signature !== expectedSignature) return null;
      if (Date.now() > parseInt(expiresAt)) return null;
      return { userId: parseInt(userId), role: 'user' };
    }

    if (dataParts.length !== 3) return null;

    const [userId, role, expiresAt] = dataParts;
    if (Date.now() > parseInt(expiresAt)) return null;

    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    if (signature !== expectedSignature) return null;

    return { userId: parseInt(userId), role };
  } catch (e) {
    return null;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken
};
