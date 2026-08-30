const { Pool } = require('pg');
require('dotenv').config();

// Verifica se estamos rodando localmente no Docker (DATABASE_URL pode ter db ou localhost)
const isLocal = process.env.DATABASE_URL && 
               (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('@db:5432'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isLocal ? {} : {
    ssl: {
      rejectUnauthorized: false
    }
  })
});

// Testa a conexão ao iniciar
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar no banco de dados (Supabase):', err.stack);
  }
  console.log('✅ Conectado ao banco de dados Supabase PostgreSQL com sucesso!');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
