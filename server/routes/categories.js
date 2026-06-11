/* ============================================
   ALUGAKI — Categories API Routes (Supabase)
   ============================================ */

const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM categories ORDER BY id ASC`);
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

module.exports = router;
