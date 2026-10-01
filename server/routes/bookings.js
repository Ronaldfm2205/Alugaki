/* ============================================
   ALUGAKI — Bookings API Routes
   ============================================ */

const express = require('express');
const router = express.Router();
const db = require('../config/db');


function generateToken() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

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

    const withdrawalToken = generateToken();
    const returnToken = generateToken();

    const result = await db.query(`
      INSERT INTO bookings (product_id, product_title, user_id, start_date, end_date, days, rental_price, protection_fee, total, payment_method, status, withdrawal_token, return_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [productId, product.title, userId || null, startDate, endDate, days, rentalPrice, protectionFee, total, paymentMethod || 'card', 'pending_withdrawal', withdrawalToken, returnToken]);

    res.status(201).json({
      message: 'Reserva criada com limite retido',
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar reserva' });
  }
});

// GET /api/bookings/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC`, [req.params.userId]);
    res.json({ data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar reservas do usuário' });
  }
});

// POST /api/bookings/validate-token
router.post('/validate-token', async (req, res) => {
  try {
    const { bookingId, token, type } = req.body;
    
    if (!bookingId || !token || !type) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const bookingResult = await db.query(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    
    const booking = bookingResult.rows[0];

    if (type === 'withdrawal') {
      if (booking.status !== 'pending_withdrawal') {
        return res.status(400).json({ error: 'Reserva não aguarda retirada' });
      }
      if (booking.withdrawal_token !== token) {
        return res.status(400).json({ error: 'Token inválido' });
      }
      
      // Simulação de Captura de Pagamento
      console.log(`[PAYMENT GATEWAY] Capturando pagamento no valor de R$ ${booking.total} para reserva ${booking.id}...`);
      
      await db.query(`UPDATE bookings SET status = 'active' WHERE id = $1`, [bookingId]);
      
      return res.json({ message: 'Retirada confirmada e pagamento capturado com sucesso!' });
    } else if (type === 'return') {
      if (booking.status !== 'active') {
        return res.status(400).json({ error: 'Reserva não está ativa' });
      }
      if (booking.return_token !== token) {
        return res.status(400).json({ error: 'Token inválido' });
      }
      
      await db.query(`UPDATE bookings SET status = 'completed' WHERE id = $1`, [bookingId]);
      
      return res.json({ message: 'Devolução confirmada com sucesso!' });
    } else {
      return res.status(400).json({ error: 'Tipo de token inválido' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao validar token' });
  }
});

// POST /api/bookings/validate-by-product
router.post('/validate-by-product', async (req, res) => {
  try {
    const { productId, token } = req.body;
    
    if (!productId || !token) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const bookingResult = await db.query(`SELECT * FROM bookings WHERE product_id = $1 AND status IN ('pending_withdrawal', 'active')`, [productId]);
    
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhuma reserva ativa aguardando validação para este produto.' });
    }

    let matchedBooking = null;
    let matchType = null;
    
    for (const b of bookingResult.rows) {
      if (b.status === 'pending_withdrawal' && b.withdrawal_token === token) {
        matchedBooking = b;
        matchType = 'withdrawal';
        break;
      } else if (b.status === 'active' && b.return_token === token) {
        matchedBooking = b;
        matchType = 'return';
        break;
      }
    }

    if (!matchedBooking) {
      return res.status(400).json({ error: 'Token inválido para os aluguéis deste produto.' });
    }

    if (matchType === 'withdrawal') {
      console.log(`[PAYMENT GATEWAY] Capturando pagamento no valor de R$ ${matchedBooking.total} para reserva ${matchedBooking.id}...`);
      await db.query(`UPDATE bookings SET status = 'active' WHERE id = $1`, [matchedBooking.id]);
      return res.json({ message: 'Retirada confirmada e pagamento capturado com sucesso!' });
    } else {
      await db.query(`UPDATE bookings SET status = 'completed' WHERE id = $1`, [matchedBooking.id]);
      return res.json({ message: 'Devolução confirmada com sucesso!' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao validar token' });
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
