const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbJsonPath = path.join(__dirname, '../data/db.json');
const data = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Iniciando migração para o Supabase...');

    // 1. Criar Tabelas
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        member_since VARCHAR(50),
        rating FLOAT DEFAULT 0,
        review_count INT DEFAULT 0,
        badges JSONB DEFAULT '[]'
      );
    `);
    console.log('Tabela users criada.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        icon VARCHAR(50)
      );
    `);
    console.log('Tabela categories criada.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        category_label VARCHAR(100),
        price_per_day FLOAT NOT NULL,
        price_per_week FLOAT NOT NULL,
        weekly_discount FLOAT DEFAULT 0,
        location VARCHAR(255),
        distance FLOAT DEFAULT 0,
        rating FLOAT DEFAULT 0,
        review_count INT DEFAULT 0,
        rentals INT DEFAULT 0,
        condition VARCHAR(50),
        images JSONB DEFAULT '[]',
        specs JSONB DEFAULT '{}',
        includes JSONB DEFAULT '[]',
        badges JSONB DEFAULT '[]',
        owner_id INT REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Tabela products criada.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id),
        product_title VARCHAR(255),
        user_id INT REFERENCES users(id),
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        days INT,
        rental_price FLOAT,
        protection_fee FLOAT,
        total FLOAT,
        payment_method VARCHAR(50),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela bookings criada.');

    // 2. Limpar dados existentes
    await client.query('TRUNCATE TABLE bookings, products, categories, users RESTART IDENTITY CASCADE');
    console.log('Tabelas antigas limpas.');

    // 3. Inserir Usuários
    for (const u of data.users) {
      await client.query(`
        INSERT INTO users (id, name, email, password, member_since, rating, review_count, badges)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [u.id, u.name, u.email, u.password, u.memberSince, u.rating, u.reviewCount, JSON.stringify(u.badges)]);
    }
    console.log('Usuários inseridos.');

    // 4. Inserir Categorias
    for (const c of data.categories) {
      await client.query(`
        INSERT INTO categories (id, name, slug, icon)
        VALUES ($1, $2, $3, $4)
      `, [c.id, c.name, c.slug, c.icon]);
    }
    console.log('Categorias inseridas.');

    // 5. Inserir Produtos
    for (const p of data.products) {
      await client.query(`
        INSERT INTO products (id, title, description, category, category_label, price_per_day, price_per_week, weekly_discount, location, distance, rating, review_count, rentals, condition, images, specs, includes, badges, owner_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      `, [p.id, p.title, p.description, p.category, p.categoryLabel, p.pricePerDay, p.pricePerWeek, p.weeklyDiscount, p.location, p.distance, p.rating, p.reviewCount, p.rentals, p.condition, JSON.stringify(p.images), JSON.stringify(p.specs), JSON.stringify(p.includes), JSON.stringify(p.badges), p.ownerId]);
    }
    console.log('Produtos inseridos.');

    console.log('✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
