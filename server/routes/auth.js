/* ============================================
   ALUGAKI — Auth API Routes (Supabase)
   ============================================ */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const security = require('../config/security');

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

module.exports = router;
