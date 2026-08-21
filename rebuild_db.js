const fs = require('fs');
const path = require('path');
const db = require('./server/config/db');

async function rebuild() {
  console.log('🔄 Recriando tabelas do banco de dados...\n');

  try {
    // Read and execute the SQL dump
    const sqlDump = fs.readFileSync(path.join(__dirname, 'database_dump.sql'), 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sqlDump
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      try {
        await db.query(stmt);
        // Show first 60 chars of each statement
        const preview = stmt.replace(/\s+/g, ' ').substring(0, 60);
        console.log(`  ✅ ${preview}...`);
      } catch (err) {
        // Ignore "already exists" or duplicate key errors
        if (err.code === '23505') {
          console.log(`  ⚠️  Dados já existem, pulando...`);
        } else {
          console.error(`  ❌ Erro: ${err.message}`);
        }
      }
    }

    console.log('\n✅ Tabelas recriadas com sucesso!');
    
    // Verify
    const users = await db.query('SELECT id, name, email FROM users ORDER BY id');
    console.log(`\n👤 Usuários: ${users.rowCount}`);
    users.rows.forEach(u => console.log(`   - ${u.name} (${u.email})`));

    const products = await db.query('SELECT id, title FROM products ORDER BY id');
    console.log(`\n📦 Produtos: ${products.rowCount}`);
    products.rows.forEach(p => console.log(`   - ${p.title}`));

    const categories = await db.query('SELECT id, name FROM categories ORDER BY id');
    console.log(`\n📁 Categorias: ${categories.rowCount}`);
    categories.rows.forEach(c => console.log(`   - ${c.name}`));

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }

  process.exit(0);
}

rebuild();
