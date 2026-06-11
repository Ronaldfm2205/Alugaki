/* ============================================
   ALUGAKI — Auth Middleware
   Simple token-based authentication
   ============================================ */

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  // Simple mock token validation
  if (!token.startsWith('mock-token-')) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // Extract user ID from token
  const parts = token.split('-');
  req.userId = parseInt(parts[2]);

  next();
}

module.exports = authMiddleware;
