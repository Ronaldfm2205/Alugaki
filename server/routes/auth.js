/* ============================================
   ALUGAKI — Auth API Routes
   ============================================ */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const security = require('../config/security');
const crypto = require('crypto');
const SUPPORT_EMAIL = (process.env.SUPPORT_EMAIL || 'suporte@alugaki.com').trim().toLowerCase();
const SUPPORT_PASSWORD = process.env.SUPPORT_PASSWORD || 'Alugaki!Suporte!2026';
const SUPPORT_USER_ID = Number(process.env.SUPPORT_USER_ID || 9999);
const DEMO_EMAIL = 'cliente@alugaki.com';
const DEMO_PASSWORD = 'Cliente@2026';
const LOCAL_TEST_ACCOUNTS = {
  teste: {
    name: 'Usuário Teste',
    email: 'teste@email.com',
    password: 'Teste@2026',
    role: 'user'
  },
  teste2: {
    name: 'Usuário Teste 2',
    email: 'teste2@email.com',
    password: 'Teste2026@2',
    role: 'user'
  }
};

async function ensureSupportUser() {
  try {
    const result = await db.query('SELECT * FROM users WHERE lower(email) = lower($1)', [SUPPORT_EMAIL]);
    if (result.rows.length > 0) {
      const existing = result.rows[0];
      const passwordMatchesConfigured = security.verifyPassword(SUPPORT_PASSWORD, existing.password);
      if (!passwordMatchesConfigured) {
        const updated = await db.query(
          `UPDATE users SET password = $1, badges = $2 WHERE id = $3 RETURNING *`,
          [security.hashPassword(SUPPORT_PASSWORD), JSON.stringify(['SUPPORT']), existing.id]
        );
        return { ...updated.rows[0], role: 'support' };
      }
      return { ...existing, role: 'support' };
    }

    const resultInsert = await db.query(
      `INSERT INTO users (name, email, password, member_since, badges, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      ['Equipe de Suporte', SUPPORT_EMAIL, security.hashPassword(SUPPORT_PASSWORD), 'Hoje', JSON.stringify(['SUPPORT']), 'support']
    );
    return { ...resultInsert.rows[0], role: 'support' };
  } catch (error) {
    console.error('Erro ao garantir usuário de suporte:', error);
    return { id: SUPPORT_USER_ID, name: 'Equipe de Suporte', email: SUPPORT_EMAIL, role: 'support', password: security.hashPassword(SUPPORT_PASSWORD), badges: ['SUPPORT'] };
  }
}

async function ensureDemoUser() {
  try {
    const result = await db.query('SELECT * FROM users WHERE lower(email) = lower($1)', [DEMO_EMAIL]);
    if (result.rows.length > 0) {
      const existing = result.rows[0];
      const passwordMatchesConfigured = security.verifyPassword(DEMO_PASSWORD, existing.password);
      if (!passwordMatchesConfigured) {
        const updated = await db.query(
          `UPDATE users SET password = $1, badges = $2 WHERE id = $3 RETURNING *`,
          [security.hashPassword(DEMO_PASSWORD), JSON.stringify(['DEMO']), existing.id]
        );
        return { ...updated.rows[0], role: 'user' };
      }
      return { ...existing, role: 'user' };
    }

    const resultInsert = await db.query(
      `INSERT INTO users (name, email, password, member_since, badges, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      ['Cliente Demo', DEMO_EMAIL, security.hashPassword(DEMO_PASSWORD), 'Hoje', JSON.stringify(['DEMO']), 'user']
    );
    return { ...resultInsert.rows[0], role: 'user' };
  } catch (error) {
    console.error('Erro ao garantir usuário demo:', error);
    return { id: 1000, name: 'Cliente Demo', email: DEMO_EMAIL, role: 'user', password: security.hashPassword(DEMO_PASSWORD), badges: ['DEMO'] };
  }
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, reset_token, reset_token_expires, ...safeUser } = user;
  return {
    ...safeUser,
    role: user.role || 'user'
  };
}

function shouldCreateLocalTestAccounts() {
  return String(process.env.ALLOW_TEST_USERS || '').toLowerCase() === 'true';
}

async function ensureBootstrapUsers() {
  if (!shouldCreateLocalTestAccounts()) {
    return;
  }

  for (const [alias, config] of Object.entries(LOCAL_TEST_ACCOUNTS)) {
    try {
      const existing = await db.query('SELECT id FROM users WHERE lower(email) = lower($1)', [config.email]);
      if (existing.rows.length > 0) continue;

      await db.query(
        `INSERT INTO users (name, email, password, member_since, badges, role)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [config.name, config.email, security.hashPassword(config.password), 'Hoje', JSON.stringify(['TESTE']), config.role]
      );
    } catch (error) {
      console.warn(`Não foi possível criar o usuário ${alias} no banco local:`, error.message);
    }
  }
}

function normalizeLoginIdentifier(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return raw.toLowerCase();
}

function getLoginIdentifierCandidates(value) {
  const normalized = normalizeLoginIdentifier(value);
  if (!normalized) return [];

  const candidates = new Set([normalized]);
  const baseName = normalized.split('@')[0];

  if (baseName) {
    candidates.add(baseName);
  }

  if (normalized.includes('@')) {
    const [localPart] = normalized.split('@');
    const domain = normalized.split('@')[1] || '';

    if (domain === 'email.com') {
      candidates.add(`${localPart}@alugaki.com`);
    }

    if (domain === 'alugaki.com') {
      candidates.add(`${localPart}@email.com`);
    }
  }

  return [...candidates];
}

async function findUserByEmail(email) {
  const normalized = normalizeLoginIdentifier(email);
  if (!normalized) return null;

  try {
    const candidates = getLoginIdentifierCandidates(normalized);
    const result = await db.query(
      `SELECT * FROM users WHERE lower(email) = ANY($1)`,
      [candidates]
    );
    if (result.rows.length > 0) {
      return result.rows[0];
    }
  } catch (error) {
    console.warn('Banco local indisponível no momento para busca de usuário:', error.message);
  }

  return null;
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail ou usuário e senha são obrigatórios' });
    }

    const normalizedEmail = normalizeLoginIdentifier(email);
    await ensureBootstrapUsers();

    const user = await findUserByEmail(normalizedEmail);
    const supportUser = await ensureSupportUser();
    const demoUser = await ensureDemoUser();

    if (user && security.verifyPassword(password, user.password)) {
      const safeUser = sanitizeUser(user);
      return res.json({
        message: 'Login realizado com sucesso',
        data: safeUser,
        token: security.generateToken(user.id, safeUser.role)
      });
    }

    if (String(email).trim().toLowerCase() === SUPPORT_EMAIL && security.verifyPassword(password, supportUser.password)) {
      return res.json({
        message: 'Login do suporte realizado com sucesso',
        data: sanitizeUser(supportUser),
        token: security.generateToken(SUPPORT_USER_ID, 'support')
      });
    }

    if (String(email).trim().toLowerCase() === DEMO_EMAIL && security.verifyPassword(password, demoUser.password)) {
      return res.json({
        message: 'Login realizado com sucesso',
        data: sanitizeUser(demoUser),
        token: security.generateToken(demoUser.id, 'user')
      });
    }

    return res.status(401).json({ error: 'E-mail ou senha inválidos' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { email, name, avatar_url, token } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'E-mail e nome do Google são obrigatórios' });
    }

    if (process.env.GOOGLE_CLIENT_ID && token) {
      const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`;
      const googleResp = await fetch(googleVerifyUrl);
      const googleData = await googleResp.json();

      if (!googleResp.ok || !googleData.email || googleData.email.toLowerCase() !== String(email).trim().toLowerCase()) {
        return res.status(401).json({ error: 'Token do Google inválido ou expirado' });
      }
    }

    let user = await findUserByEmail(email);

    if (!user) {
      const memberSince = new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      const generatedPassword = security.hashPassword(crypto.randomBytes(16).toString('hex'));

      try {
        const result = await db.query(`
          INSERT INTO users (name, email, password, member_since, badges, avatar_url)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [name, email, generatedPassword, memberSince, JSON.stringify(['GOOGLE']), avatar_url || null]);
        user = result.rows[0];
      } catch (dbError) {
        console.warn('Google DB insert failed:', dbError.message);
        return res.status(500).json({ error: 'Erro ao criar conta do Google no banco local' });
      }
    }

    const safeUser = sanitizeUser(user);
    return res.json({
      message: 'Login com Google realizado com sucesso',
      data: safeUser,
      token: security.generateToken(user.id, safeUser.role)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao autenticar com Google' });
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

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado' });
    }

    const memberSince = new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    const hashedPassword = security.hashPassword(password);

    try {
      const result = await db.query(`
        INSERT INTO users (name, email, password, member_since, badges)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, member_since, rating, review_count, badges
      `, [name, email, hashedPassword, memberSince, JSON.stringify([])]);

      const newUser = result.rows[0];
      const safeUser = sanitizeUser(newUser);

      return res.status(201).json({
        message: 'Conta criada com sucesso',
        data: safeUser,
        token: security.generateToken(newUser.id, safeUser.role)
      });
    } catch (dbError) {
      console.error('Erro ao criar conta no banco local:', dbError.message);
      return res.status(500).json({ error: 'Erro ao criar conta no banco local' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});


module.exports = router;

