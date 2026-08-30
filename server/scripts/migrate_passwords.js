const db = require('../config/db');
const security = require('../config/security');

async function migratePasswords() {
  console.log('🔄 Iniciando migração de senhas para SHA-256...');
  
  try {
    const result = await db.query('SELECT id, email, password FROM users');
    let migratedCount = 0;
    
    for (const user of result.rows) {
      // Se a senha não possuir ':', ela não tem salt, logo está em texto puro (ou formato legado)
      if (!user.password.includes(':')) {
        console.log(`🔐 Atualizando hash do usuário: ${user.email}`);
        const newHash = security.hashPassword(user.password);
        
        await db.query(
          'UPDATE users SET password = $1 WHERE id = $2',
          [newHash, user.id]
        );
        migratedCount++;
      }
    }
    
    console.log(`✅ Migração concluída! ${migratedCount} senhas atualizadas para SHA-256.`);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    process.exit(0);
  }
}

migratePasswords();
