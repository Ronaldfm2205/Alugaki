/* ============================================
   ALUGAKI — Express Server
   Main server entry point
   ============================================ */

const express = require('express');
const path = require('path');
const cors = require('cors');
const net = require('net');

const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const bookingsRouter = require('./routes/bookings');
const categoriesRouter = require('./routes/categories');
const supportRouter = require('./routes/support');

const app = express();
const preferredPort = Number(process.env.PORT || 3000);

function findAvailablePort(startPort) {
  const ports = [startPort, startPort + 1, 3001, 3002];

  return new Promise((resolve, reject) => {
    const tryPort = (index) => {
      const port = ports[index];
      if (!port) {
        reject(new Error('Nenhuma porta disponível encontrada.'));
        return;
      }

      const testServer = net.createServer();
      testServer.once('error', () => tryPort(index + 1));
      testServer.once('listening', () => {
        testServer.close(() => resolve(port));
      });
      testServer.listen(port);
    };

    tryPort(0);
  });
}

function applySecurityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Cache-Control', 'no-store');
  next();
}

function rateLimit(maxRequests = 120, windowMs = 60 * 1000) {
  const map = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const window = map.get(ip) || [];
    const recent = window.filter((timestamp) => timestamp > now - windowMs);
    recent.push(now);

    if (recent.length > maxRequests) {
      return res.status(429).json({ error: 'Muitas requisições detectadas. Tente novamente mais tarde.' });
    }

    map.set(ip, recent);
    next();
  };
}

// ── Middleware ──
app.use(applySecurityHeaders);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(rateLimit(200, 60 * 1000));

// ── Serve static files from project root ──
app.use(express.static(path.join(__dirname, '..')));

// ── API Routes ──
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/support', supportRouter);

// ── Fallback: serve index.html for non-API routes ──
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
});

// ── Start Server ──
findAvailablePort(preferredPort)
  .then((finalPort) => {
    app.listen(finalPort, () => {
      console.log(`\n  🏠 ALUGAKI Server running at:`);
      console.log(`  ➜  http://localhost:${finalPort}\n`);
      console.log(`  API endpoints:`);
      console.log(`  ➜  GET  /api/products`);
      console.log(`  ➜  GET  /api/products/:id`);
      console.log(`  ➜  GET  /api/products/featured`);
      console.log(`  ➜  GET  /api/categories`);
      console.log(`  ➜  POST /api/auth/login`);
      console.log(`  ➜  POST /api/auth/register`);
      console.log(`  ➜  POST /api/auth/google`);
      console.log(`  ➜  GET  /api/support/conversations`);
      console.log(`  ➜  POST /api/support/message`);
      console.log(`  ➜  POST /api/support/reply`);
      console.log(`  ➜  POST /api/bookings`);
      console.log(`  ➜  GET  /api/bookings/:id\n`);
    });
  })
  .catch((error) => {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  });

module.exports = app;
