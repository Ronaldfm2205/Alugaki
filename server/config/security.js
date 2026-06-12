const crypto = require('crypto');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-alugaki-key-1234';

/**
 * Hash password using PBKDF2 SHA-512
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password using PBKDF2 SHA-512, with fallback for seeded plain-text passwords
 */
function verifyPassword(password, storedPassword) {
  if (!storedPassword) return false;
  
  // Fallback for plain text legacy passwords (e.g. from initial seeds)
  if (!storedPassword.includes(':')) {
    return password === storedPassword;
  }
  
  const [salt, hash] = storedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

/**
 * Generate cryptographically signed token (HMAC SHA-256)
 */
function generateToken(userId) {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h
  const data = `${userId}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
  return `secure-token-${data}-${signature}`;
}

/**
 * Verify signed token and return userId if valid
 */
function verifyToken(token) {
  if (!token || !token.startsWith('secure-token-')) {
    return null;
  }
  
  try {
    const payload = token.slice('secure-token-'.length);
    const parts = payload.split('-');
    if (parts.length !== 2) return null;
    
    const [data, signature] = parts;
    const dataParts = data.split(':');
    if (dataParts.length !== 2) return null;
    
    const [userId, expiresAt] = dataParts;
    
    // Verify expiration
    if (Date.now() > parseInt(expiresAt)) {
      return null;
    }
    
    // Verify signature
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    if (signature !== expectedSignature) {
      return null;
    }
    
    return parseInt(userId);
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
