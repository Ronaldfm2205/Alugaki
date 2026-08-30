-- ============================================
-- ALUGAKI — Database Initial Dump
-- Run this script in your PostgreSQL database to create tables and insert mock data.
-- ============================================

-- 1. Create Tables

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  member_since VARCHAR(50),
  rating FLOAT DEFAULT 0,
  review_count INT DEFAULT 0,
  badges JSONB DEFAULT '[]',
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50)
);

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

-- 2. Insert Test Users
INSERT INTO users (id, name, email, password, member_since, rating, review_count, badges) VALUES
(1, 'Ricardo M.', 'ricardo@email.com', '12345678', 'Out 2021', 4.9, 124, '["IDENTIDADE VERIFICADA", "SUPER OWNER"]'),
(2, 'Ana C.', 'ana@email.com', '12345678', 'Mar 2022', 4.7, 56, '["IDENTIDADE VERIFICADA"]'),
(3, 'Carlos S.', 'carlos@email.com', '12345678', 'Jan 2023', 4.8, 32, '["IDENTIDADE VERIFICADA", "SUPER OWNER"]');

-- 3. Insert Categories
INSERT INTO categories (id, name, slug, icon) VALUES
(1, 'Ferramentas', 'ferramentas', 'wrench'),
(2, 'Eletrônicos', 'eletronicos', 'monitor'),
(3, 'Festas', 'festas', 'party'),
(4, 'Esportes', 'esportes', 'bike'),
(5, 'Eletrodomésticos', 'eletrodomesticos', 'home'),
(6, 'Jardinagem', 'jardinagem', 'leaf'),
(7, 'Motos', 'motos', 'bike');

-- 4. Insert Products
INSERT INTO products (title, description, category, category_label, price_per_day, price_per_week, weekly_discount, location, distance, rating, review_count, rentals, condition, images, specs, includes, badges, owner_id) VALUES
('Câmera Sony Alpha', 'Kit completo com câmera Sony Alpha a7 IV, lente 28-70mm e acessórios. Ideal para fotografia profissional e vídeos em 4K.', 'eletronicos', 'Eletrônicos & Câmeras', 180, 1071, 15, 'Brooklin, São Paulo', 3.2, 4.9, 28, 67, 'como-novo', '["assets/images/camera_sony.png"]', '{"Resolução": "33 MP", "Vídeo": "4K 60fps"}', '["Lente 28-70mm"]', '[]', 1),
('Bicicleta Elétrica', 'Bicicleta elétrica com motor de 350W e autonomia de até 60km. Perfeita para deslocamentos urbanos com conforto e sustentabilidade.', 'esportes', 'Esportes', 95, 565, 15, 'Vila Madalena, SP', 5.1, 4.8, 15, 34, 'bom', '["assets/images/bicicleta_eletrica.png"]', '{"Motor": "350W"}', '["Carregador"]', '[]', 2),
('Honda CB 500F', 'Moto naked esportiva Honda CB 500F com motor bicilíndrico de 471cc e 50 cv.', 'motos', 'Motos', 120, 600, 0, 'São Paulo, SP', 3.5, 4.8, 0, 28, 'excelente', '["assets/images/moto_naked.png"]', '{}', '[]', '[]', 1);

-- 5. Update Sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
