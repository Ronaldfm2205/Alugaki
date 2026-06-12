const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function alterUsers() {
  const client = await pool.connect();
  try {
    console.log('Adicionando colunas de perfil na tabela users...');
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]';`);
    console.log('✅ Tabela users atualizada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao atualizar tabela users:', error);
  } finally {
    client.release();
    pool.end();
  }
}

alterUsers();
