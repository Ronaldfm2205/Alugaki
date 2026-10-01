const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/alugaki_db';

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar no PostgreSQL local:', err.stack);
  }
  console.log('✅ Conectado ao PostgreSQL local com Docker com sucesso!');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
