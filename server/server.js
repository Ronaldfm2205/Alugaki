/* ============================================
   ALUGAKI — Express Server
   Main server entry point
   ============================================ */

const express = require('express');
const path = require('path');
const cors = require('cors');

const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const bookingsRouter = require('./routes/bookings');
const categoriesRouter = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── Serve static files from project root ──
app.use(express.static(path.join(__dirname, '..')));

// ── API Routes ──
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/categories', categoriesRouter);

// ── Fallback: serve index.html for non-API routes ──
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
});

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`\n  🏠 ALUGAKI Server running at:`);
  console.log(`  ➜  http://localhost:${PORT}\n`);
  console.log(`  API endpoints:`);
  console.log(`  ➜  GET  /api/products`);
  console.log(`  ➜  GET  /api/products/:id`);
  console.log(`  ➜  GET  /api/products/featured`);
  console.log(`  ➜  GET  /api/categories`);
  console.log(`  ➜  POST /api/auth/login`);
  console.log(`  ➜  POST /api/auth/register`);
  console.log(`  ➜  POST /api/bookings`);
  console.log(`  ➜  GET  /api/bookings/:id\n`);
});

module.exports = app;
