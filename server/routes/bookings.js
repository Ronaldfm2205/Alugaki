/* ============================================
   ALUGAKI — Bookings API Routes (Supabase)
   ============================================ */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', async (req, res) => {
  try {
    const { productId, userId, startDate, endDate, paymentMethod } = req.body;

    if (!productId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Produto, data de início e data de fim são obrigatórios' });
    }

    const prodResult = await db.query(`SELECT * FROM products WHERE id = $1`, [productId]);
    if (prodResult.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    const product = prodResult.rows[0];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return res.status(400).json({ error: 'A data de devolução deve ser após a data de retirada' });
    }

    const rentalPrice = product.price_per_day * days;
    const protectionFee = Math.round(rentalPrice * 0.1);
    const total = rentalPrice + protectionFee;

    const result = await db.query(`
      INSERT INTO bookings (product_id, product_title, user_id, start_date, end_date, days, rental_price, protection_fee, total, payment_method, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [productId, product.title, userId || null, startDate, endDate, days, rentalPrice, protectionFee, total, paymentMethod || 'card', 'confirmed']);

    res.status(201).json({
      message: 'Reserva criada com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar reserva' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM bookings WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar reserva' });
  }
});

module.exports = router;
