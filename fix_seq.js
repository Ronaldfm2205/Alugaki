const db = require('./server/config/db');

async function fixSequences() {
  try {
    await db.query(`SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));`);
    await db.query(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));`);
    await db.query(`SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));`);
    console.log('Sequences atualizadas com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar sequences:', error);
  } finally {
    process.exit(0);
  }
}

fixSequences();
