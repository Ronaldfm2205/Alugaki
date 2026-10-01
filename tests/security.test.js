/* ============================================
   ALUGAKI — Unit Tests: Security Module
   Tests for password hashing, token generation
   and verification using Jest
   ============================================ */

const security = require('../server/config/security');

describe('Security Module', () => {

  // ── Password Hashing ──
  describe('hashPassword()', () => {
    test('deve retornar uma string com salt e hash separados por ":"', () => {
      const hashed = security.hashPassword('MinhaSenh@123');
      expect(hashed).toContain(':');
      const parts = hashed.split(':');
      expect(parts).toHaveLength(2);
      expect(parts[0].length).toBeGreaterThan(0); // salt
      expect(parts[1].length).toBeGreaterThan(0); // hash
    });

    test('deve gerar hashes diferentes para a mesma senha (salt aleatório)', () => {
      const hash1 = security.hashPassword('MesmaSenha123');
      const hash2 = security.hashPassword('MesmaSenha123');
      expect(hash1).not.toBe(hash2);
    });
  });

  // ── Password Verification ──
  describe('verifyPassword()', () => {
    test('deve verificar senha correta contra hash PBKDF2', () => {
      const password = 'Senha@Segura2026';
      const hashed = security.hashPassword(password);
      expect(security.verifyPassword(password, hashed)).toBe(true);
    });

    test('deve rejeitar senha incorreta', () => {
      const hashed = security.hashPassword('SenhaCorreta');
      expect(security.verifyPassword('SenhaErrada', hashed)).toBe(false);
    });

    test('deve retornar false para storedPassword vazia ou null', () => {
      expect(security.verifyPassword('qualquer', null)).toBe(false);
      expect(security.verifyPassword('qualquer', '')).toBe(false);
    });

    test('deve aceitar senhas em texto puro (fallback para seeds)', () => {
      expect(security.verifyPassword('admin123', 'admin123')).toBe(true);
      expect(security.verifyPassword('admin123', 'outra')).toBe(false);
    });
  });

  // ── Token Generation ──
  describe('generateToken()', () => {
    test('deve gerar token com prefixo "secure-token-"', () => {
      const token = security.generateToken(1, 'user');
      expect(token.startsWith('secure-token-')).toBe(true);
    });

    test('deve conter userId e role no payload do token', () => {
      const token = security.generateToken(42, 'admin');
      expect(token).toContain('42');
      expect(token).toContain('admin');
    });

    test('tokens diferentes para userIds diferentes', () => {
      const token1 = security.generateToken(1, 'user');
      const token2 = security.generateToken(2, 'user');
      expect(token1).not.toBe(token2);
    });
  });

  // ── Token Verification ──
  describe('verifyToken()', () => {
    test('deve verificar e decodificar token válido', () => {
      const token = security.generateToken(10, 'user');
      const payload = security.verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload.userId).toBe(10);
      expect(payload.role).toBe('user');
    });

    test('deve retornar null para token inválido', () => {
      expect(security.verifyToken('token-invalido')).toBeNull();
      expect(security.verifyToken('')).toBeNull();
      expect(security.verifyToken(null)).toBeNull();
    });

    test('deve retornar null para token com assinatura adulterada', () => {
      const token = security.generateToken(1, 'user');
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(security.verifyToken(tampered)).toBeNull();
    });

    test('deve respeitar role "support"', () => {
      const token = security.generateToken(9999, 'support');
      const payload = security.verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload.role).toBe('support');
    });
  });

});
