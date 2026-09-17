/* ============================================
   ALUGAKI — Auth Middleware
   Secure token-based authentication
   ============================================ */

const security = require('../config/security');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  const payload = security.verifyToken(token);

  if (!payload || !payload.userId) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }

  req.userId = payload.userId;
  req.userRole = payload.role || 'user';
  next();
}

module.exports = authMiddleware;
