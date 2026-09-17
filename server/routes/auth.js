/* ============================================
   ALUGAKI — Auth API Routes
   ============================================ */

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const security = require('../config/security');
const crypto = require('crypto');

const localUsersPath = path.join(__dirname, '../data/users.json');
const SUPPORT_EMAIL = (process.env.SUPPORT_EMAIL || 'suporte@alugaki.com').trim().toLowerCase();
const SUPPORT_PASSWORD = process.env.SUPPORT_PASSWORD || 'Alugaki!Suporte!2026';
const SUPPORT_USER_ID = Number(process.env.SUPPORT_USER_ID || 9999);
const DEMO_EMAIL = 'cliente@alugaki.com';
const DEMO_PASSWORD = 'Cliente@2026';
const LOCAL_TEST_ACCOUNTS = {
  teste: {
    name: 'Usuário Teste',
    email: 'teste@alugaki.com',
    password: 'Teste@123',
    role: 'user'
  },
  teste2: {
    name: 'Usuário Teste 2',
    email: 'teste2@alugaki.com',
    password: 'Teste2@123',
    role: 'user'
  }
};

function ensureLocalUsersFile() {
  const dir = path.dirname(localUsersPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(localUsersPath)) {
    fs.writeFileSync(localUsersPath, JSON.stringify({ users: [] }, null, 2));
  }
}

function readLocalUsers() {
  ensureLocalUsersFile();
  try {
    const raw = fs.readFileSync(localUsersPath, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data.users) ? data.users : [];
  } catch (error) {
    return [];
  }
}

function writeLocalUsers(users) {
  ensureLocalUsersFile();
  fs.writeFileSync(localUsersPath, JSON.stringify({ users }, null, 2));
}

function getLocalUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return null;
  const users = readLocalUsers();
  return users.find((user) => String(user.email || '').trim().toLowerCase() === normalized) || null;
}

function saveLocalUser(user) {
  const users = readLocalUsers();
  const index = users.findIndex((item) => String(item.email || '').trim().toLowerCase() === String(user.email || '').trim().toLowerCase());
  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    users.push(user);
  }
  writeLocalUsers(users);
  return user;
}

function ensureSupportUser() {
  const existing = getLocalUserByEmail(SUPPORT_EMAIL);

  if (existing) {
    const passwordMatchesConfigured = security.verifyPassword(SUPPORT_PASSWORD, existing.password);
    if (!passwordMatchesConfigured) {
      const updated = { ...existing, password: security.hashPassword(SUPPORT_PASSWORD), role: 'support' };
      saveLocalUser(updated);
      return updated;
    }
    return { ...existing, role: 'support' };
  }

  const supportUser = {
    id: SUPPORT_USER_ID,
    name: 'Equipe de Suporte',
    email: SUPPORT_EMAIL,
    role: 'support',
    member_since: 'Hoje',
    password: security.hashPassword(SUPPORT_PASSWORD),
    badges: ['SUPPORT']
  };

  saveLocalUser(supportUser);
  return supportUser;
}

function ensureDemoUser() {
  const existing = getLocalUserByEmail(DEMO_EMAIL);
  if (existing) {
    const passwordMatchesConfigured = security.verifyPassword(DEMO_PASSWORD, existing.password);
    if (!passwordMatchesConfigured) {
      const updated = { ...existing, password: security.hashPassword(DEMO_PASSWORD), role: 'user' };
      saveLocalUser(updated);
      return updated;
    }
    return existing;
  }

  const demoUser = {
    id: 1000,
    name: 'Cliente Demo',
    email: DEMO_EMAIL,
    role: 'user',
    member_since: 'Hoje',
    password: security.hashPassword(DEMO_PASSWORD),
    badges: ['DEMO']
  };

  saveLocalUser(demoUser);
  return demoUser;
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, reset_token, reset_token_expires, ...safeUser } = user;
  return {
    ...safeUser,
    role: user.role || 'user'
  };
}

function ensureBootstrapUsers() {
  const users = readLocalUsers();
  if (users.length > 0) {
    return;
  }

  Object.entries(LOCAL_TEST_ACCOUNTS).forEach(([_, config]) => {
    saveLocalUser({
      id: Date.now() + Math.floor(Math.random() * 1000),
      name: config.name,
      email: config.email,
      password: security.hashPassword(config.password),
      role: config.role,
      member_since: 'Hoje',
      badges: ['TESTE']
    });
  });
}

function ensureLocalTestAccounts() {
  const users = readLocalUsers();
  if (users.length > 0) {
    return;
  }

  ensureBootstrapUsers();
}

function normalizeLoginIdentifier(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const normalized = raw.toLowerCase();
  return normalized.includes('@') ? normalized : normalized;
}

async function findUserByEmail(email) {
  const normalized = normalizeLoginIdentifier(email);
  if (!normalized) return null;

  try {
    const result = await db.query(`SELECT * FROM users WHERE lower(email) = lower($1)`, [normalized]);
    if (result.rows.length > 0) {
      return result.rows[0];
    }
  } catch (error) {
    console.warn('Database unavailable, using local store for auth fallback.');
  }

  const localUser = getLocalUserByEmail(normalized);
  if (localUser) return localUser;

  const aliasMatch = Object.entries(LOCAL_TEST_ACCOUNTS).find(([alias, config]) =>
    alias === normalized || config.email === normalized
  );

  if (aliasMatch) {
    return getLocalUserByEmail(aliasMatch[1].email) || getLocalUserByEmail(aliasMatch[0]);
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
    ensureBootstrapUsers();

    const user = await findUserByEmail(normalizedEmail);
    const supportUser = ensureSupportUser();
    const demoUser = ensureDemoUser();

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
        console.warn('Google DB insert failed, using local fallback storage.');
        user = saveLocalUser({
          id: Date.now(),
          name,
          email: email.toLowerCase(),
          password: generatedPassword,
          member_since: memberSince,
          badges: ['GOOGLE'],
          avatar_url: avatar_url || null,
          role: 'user'
        });
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
      const localUser = saveLocalUser({
        id: Date.now(),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        member_since: memberSince,
        badges: [],
        role: 'user'
      });

      return res.status(201).json({
        message: 'Conta criada com sucesso',
        data: sanitizeUser(localUser),
        token: security.generateToken(localUser.id, 'user')
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

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
