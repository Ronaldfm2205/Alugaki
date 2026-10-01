/* ============================================
   ALUGAKI — Users API Routes
   Profile management, password recovery
   Separated from auth.js for SRP compliance
   ============================================ */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const security = require('../config/security');
const crypto = require('crypto');

/**
 * Helper to remove sensitive fields before sending user data
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { password, reset_token, reset_token_expires, ...safeUser } = user;
  return {
    ...safeUser,
    role: user.role || 'user'
  };
}

/**
 * PUT /api/users/profile
 * Atualiza dados do perfil do usuário autenticado
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, password, avatar_url, addresses } = req.body;

    const userResult = await db.query(`SELECT * FROM users WHERE id = $1`, [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const currentUser = userResult.rows[0];

    const finalName = name || currentUser.name;
    const finalEmail = email || currentUser.email;
    const finalPassword = password ? security.hashPassword(password) : currentUser.password;
    const finalAvatar = avatar_url !== undefined ? avatar_url : currentUser.avatar_url;
    const finalAddresses = addresses !== undefined ? JSON.stringify(addresses) : (currentUser.addresses ? JSON.stringify(currentUser.addresses) : null);

    const result = await db.query(`
      UPDATE users
      SET name = $1, email = $2, password = $3, avatar_url = $4, addresses = $5
      WHERE id = $6
      RETURNING id, name, email, member_since, rating, review_count, badges, avatar_url, addresses
    `, [finalName, finalEmail, finalPassword, finalAvatar, finalAddresses, userId]);

    res.json({
      message: 'Perfil atualizado com sucesso',
      data: sanitizeUser(result.rows[0]),
      token: security.generateToken(userId, req.userRole || 'user')
    });
  } catch (error) {
    console.error('🔴 ERRO AO ATUALIZAR PERFIL:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil', details: error.message });
  }
});

/**
 * POST /api/users/forgot-password
 * Solicita recuperação de senha via e-mail
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'O e-mail é obrigatório' });
    }

    const userResult = await db.query('SELECT id, name FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.json({ message: 'Se o e-mail existir, um link de recuperação será enviado.' });
    }

    const user = userResult.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 3600000);

    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, tokenExpires, user.id]
    );

    const resetUrl = `http://localhost:3000/esqueci_senha.html?token=${resetToken}`;
    console.log(`\n📧 [SIMULAÇÃO DE E-MAIL]`);
    console.log(`Para: ${email}`);
    console.log(`Assunto: Recuperação de Senha - Alugaki`);
    console.log(`Olá ${user.name},`);
    console.log(`Para redefinir sua senha, clique no link abaixo (válido por 1 hora):`);
    console.log(`${resetUrl}\n`);

    res.json({ message: 'Se o e-mail existir, um link de recuperação será enviado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar solicitação de recuperação de senha' });
  }
});

/**
 * POST /api/users/reset-password
 * Redefine a senha usando token de recuperação
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 8 caracteres' });
    }

    const userResult = await db.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const userId = userResult.rows[0].id;
    const hashedPassword = security.hashPassword(newPassword);

    await db.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao redefinir a senha' });
  }
});

module.exports = router;
