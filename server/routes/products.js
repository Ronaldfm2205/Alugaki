/* ============================================
   ALUGAKI — Products API Routes (Supabase)
   ============================================ */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

/**
 * GET /api/products/featured
 * Returns featured/popular products
 */
router.get('/featured', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM products 
      ORDER BY rating DESC, rentals DESC 
      LIMIT 4
    `);
    res.json({ data: result.rows, total: result.rowCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produtos em destaque' });
  }
});

/**
 * GET /api/products
 * List products with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { categoria, precoMin, precoMax, distancia, estado, ordenar, q, page = 1, limit = 12 } = req.query;
    
    let query = `SELECT * FROM products WHERE 1=1`;
    let values = [];
    let valueIndex = 1;

    // Text search
    if (q) {
      query += ` AND (title ILIKE $${valueIndex} OR description ILIKE $${valueIndex} OR category_label ILIKE $${valueIndex})`;
      values.push(`%${q}%`);
      valueIndex++;
    }

    // Category filter
    if (categoria) {
      const cats = categoria.split(',');
      query += ` AND category = ANY($${valueIndex}::text[])`;
      values.push(cats);
      valueIndex++;
    }

    // Price filter
    if (precoMin) {
      query += ` AND price_per_day >= $${valueIndex}`;
      values.push(parseInt(precoMin));
      valueIndex++;
    }
    if (precoMax) {
      query += ` AND price_per_day <= $${valueIndex}`;
      values.push(parseInt(precoMax));
      valueIndex++;
    }

    // Condition
    if (estado) {
      const states = estado.split(',');
      query += ` AND condition = ANY($${valueIndex}::text[])`;
      values.push(states);
      valueIndex++;
    }

    // Sorting
    switch (ordenar) {
      case 'price-asc':
        query += ` ORDER BY price_per_day ASC`;
        break;
      case 'price-desc':
        query += ` ORDER BY price_per_day DESC`;
        break;
      case 'rating':
        query += ` ORDER BY rating DESC`;
        break;
      case 'distance':
        query += ` ORDER BY distance ASC`;
        break;
      default:
        query += ` ORDER BY id DESC`;
    }

    // Calculate pagination manually to get TOTAL count as well
    const allResults = await db.query(query, values);
    const total = allResults.rowCount;

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    
    query += ` LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
    values.push(parseInt(limit), startIndex);

    const paginatedResults = await db.query(query, values);

    res.json({
      data: paginatedResults.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

/**
 * GET /api/products/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`SELECT * FROM products WHERE id = $1`, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const product = result.rows[0];

    // Fetch owner
    const ownerResult = await db.query(`SELECT id, name, member_since, rating, review_count, badges FROM users WHERE id = $1`, [product.owner_id]);
    const owner = ownerResult.rows[0] || null;

    res.json({ data: { ...product, owner } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

/**
 * POST /api/products
 * Criar novo produto (Usado na página Anunciar Item)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, pricePerDay, condition, location, images } = req.body;
    
    const result = await db.query(`
      INSERT INTO products (
        title, description, category, price_per_day, price_per_week, 
        condition, location, images, owner_id, category_label
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      title, description, category, pricePerDay, pricePerDay * 6,
      condition, location, JSON.stringify(images), req.userId,
      category
    ]);

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

/**
 * GET /api/products/me
 * Lista produtos do usuário autenticado
 */
router.get('/me/list', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM products WHERE owner_id = $1 ORDER BY id DESC`, [req.userId]);
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar seus anúncios' });
  }
});

/**
 * PUT /api/products/:id
 * Atualiza um produto (se for dono)
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, pricePerDay } = req.body; // Campos simplificados para edição no MVP
    
    // Verifica posse
    const check = await db.query(`SELECT owner_id FROM products WHERE id = $1`, [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    if (check.rows[0].owner_id !== req.userId) return res.status(403).json({ error: 'Você não tem permissão para editar este anúncio' });

    const result = await db.query(`
      UPDATE products SET title = $1, price_per_day = $2, price_per_week = $3
      WHERE id = $4 RETURNING *
    `, [title, pricePerDay, pricePerDay * 6, id]);

    res.json({ message: 'Produto atualizado', data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

/**
 * DELETE /api/products/:id
 * Exclui um produto (se for dono)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const check = await db.query(`SELECT owner_id FROM products WHERE id = $1`, [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    if (check.rows[0].owner_id !== req.userId) return res.status(403).json({ error: 'Você não tem permissão para excluir este anúncio' });

    // CUIDADO: Deleta as reservas vinculadas primeiro (se houver CASCADE no BD não precisaria, mas para garantir)
    await db.query(`DELETE FROM bookings WHERE product_id = $1`, [id]);
    await db.query(`DELETE FROM products WHERE id = $1`, [id]);

    res.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
});

module.exports = router;
