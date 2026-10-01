/* ============================================
   ALUGAKI — Categories API Routes
   ============================================ */

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const db = require('../config/db');

const localDbPath = path.join(__dirname, '../data/db.json');

function getLocalCategories() {
  try {
    const raw = fs.readFileSync(localDbPath, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data.categories) ? data.categories : [];
  } catch (error) {
    return [];
  }
}

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM categories ORDER BY id ASC`);
    res.json({ data: result.rows });
  } catch (error) {
    const fallback = getLocalCategories();
    if (fallback.length > 0) {
      return res.json({ data: fallback });
    }
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

module.exports = router;
