/* ============================================
   ALUGAKI — Auth API Routes (Supabase)
   ============================================ */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const result = await db.query(`SELECT * FROM users WHERE email = $1 AND password = $2`, [email, password]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    const user = result.rows[0];
    const { password: _, ...userData } = user;

    res.json({
      message: 'Login realizado com sucesso',
      data: userData,
      token: `mock-token-${user.id}-${Date.now()}`
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
    
    const result = await db.query(`
      INSERT INTO users (name, email, password, member_since, badges)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, member_since, rating, review_count, badges
    `, [name, email, password, memberSince, JSON.stringify([])]);

    const newUser = result.rows[0];

    res.status(201).json({
      message: 'Conta criada com sucesso',
      data: newUser,
      token: `mock-token-${newUser.id}-${Date.now()}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

module.exports = router;
