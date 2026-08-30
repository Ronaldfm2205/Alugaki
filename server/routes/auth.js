/* ============================================
   ALUGAKI — Auth API Routes (Supabase)
   ============================================ */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const security = require('../config/security');
const crypto = require('crypto');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    // Retrieve user by email only, then verify hashed password
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);

    if (result.rows.length === 0 || !security.verifyPassword(password, result.rows[0].password)) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    const user = result.rows[0];
    const { password: _, ...userData } = user;

    res.json({
      message: 'Login realizado com sucesso',
      data: userData,
      token: security.generateToken(user.id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de e-mail inválido' });
    }

    const existing = await db.query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado' });
    }

    const memberSince = new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    const hashedPassword = security.hashPassword(password);
    
    const result = await db.query(`
      INSERT INTO users (name, email, password, member_since, badges)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, member_since, rating, review_count, badges
    `, [name, email, hashedPassword, memberSince, JSON.stringify([])]);

    const newUser = result.rows[0];

    res.status(201).json({
      message: 'Conta criada com sucesso',
      data: newUser,
      token: security.generateToken(newUser.id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, password, avatar_url, addresses } = req.body;

    // Get current user to merge fields if not provided
    const userResult = await db.query(`SELECT * FROM users WHERE id = $1`, [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const currentUser = userResult.rows[0];

    const finalName = name || currentUser.name;
    const finalEmail = email || currentUser.email;
    
    // Hash new password if provided
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
      data: result.rows[0],
      token: security.generateToken(userId)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'O e-mail é obrigatório' });
    }

    const userResult = await db.query('SELECT id, name FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // Retornar sucesso de qualquer forma por segurança (prevenir user enumeration)
      return res.json({ message: 'Se o e-mail existir, um link de recuperação será enviado.' });
    }

    const user = userResult.rows[0];
    
    // Gerar token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 3600000); // 1 hora a partir de agora

    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, tokenExpires, user.id]
    );

    // Simulação do envio de e-mail (imprimir link no console)
    const resetUrl = \`http://localhost:3000/esqueci_senha.html?token=\${resetToken}\`;
    console.log(\`\n📧 [SIMULAÇÃO DE E-MAIL]\`);
    console.log(\`Para: \${email}\`);
    console.log(\`Assunto: Recuperação de Senha - Alugaki\`);
    console.log(\`Olá \${user.name},\`);
    console.log(\`Para redefinir sua senha, clique no link abaixo (válido por 1 hora):\`);
    console.log(\`\${resetUrl}\n\`);

    res.json({ message: 'Se o e-mail existir, um link de recuperação será enviado.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar solicitação de recuperação de senha' });
  }
});

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
