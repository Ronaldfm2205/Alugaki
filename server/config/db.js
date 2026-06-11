const { Pool } = require('pg');
require('dotenv').config();

// Configura o pool de conexão utilizando a variável de ambiente DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessário para a maioria das conexões remotas do Supabase/Postgres
  }
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
