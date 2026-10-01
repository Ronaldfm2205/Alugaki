
document.addEventListener('DOMContentLoaded', async () => {
  const userJson = localStorage.getItem('alugaki_user');
  if (!userJson) {
    window.location.href = 'login.html';
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product_id');
  const startDate = urlParams.get('start');
  const endDate = urlParams.get('end');

  if (!productId || !startDate || !endDate) {
    alert('Dados de reserva inválidos.');
    window.location.href = 'busca.html';
    return;
  }

  try {
    const res = await window.AlugakiAPI.products.getById(productId);
    const p = res.data;
    
    // Fill summary
    if (p.images && p.images.length > 0) {
      document.getElementById('summary-img').style.backgroundImage = `url('${p.images[0]}')`;
    }
    document.getElementById('summary-title').textContent = p.title;
    document.getElementById('summary-location').textContent = p.location;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    document.getElementById('summary-start').textContent = start.toLocaleDateString('pt-BR');
    document.getElementById('summary-end').textContent = end.toLocaleDateString('pt-BR');
    document.getElementById('summary-days').textContent = days;

    const price = p.price_per_day * days;
    const fee = Math.round(price * 0.1);
    const total = price + fee;

    document.getElementById('summary-daily-price').textContent = `R$ ${p.price_per_day.toFixed(2)}`;
    document.getElementById('summary-subtotal').textContent = `R$ ${price.toFixed(2)}`;
    document.getElementById('summary-fee').textContent = `R$ ${fee.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `R$ ${total.toFixed(2)}`;

    initCheckoutForm(productId, startDate, endDate);
  } catch (err) {
    console.error(err);
    alert('Erro ao carregar dados.');
  }
});

function initCheckoutForm(productId, startDate, endDate) {
  const form = document.getElementById('checkout-form');
  const btn = document.getElementById('btn-checkout');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Processando...`;
    btn.disabled = true;

    try {
      const user = JSON.parse(localStorage.getItem('alugaki_user'));
      
      const payload = {
        productId,
        userId: user.id,
        startDate,
        endDate,
        paymentMethod: 'card_hold' // Simulando retenção
      };

      const bookingRes = await window.AlugakiAPI.bookings.create(payload);
      const bookingData = bookingRes.data;
      
      // Simulando tempo de processamento de cartão (2s)
      setTimeout(() => {
        document.getElementById('payment-section').style.display = 'none';
        document.getElementById('success-section').style.display = 'block';
        initTokenFlow(bookingData);
      }, 2000);

    } catch (err) {
      console.error(err);
      alert('Erro ao processar pagamento.');
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Finalizar Reserva e Reter Limite`;
      btn.disabled = false;
    }
  });
}

function initTokenFlow(booking) {
  const btnGenerate = document.getElementById('btn-generate-token');
  const generatorArea = document.getElementById('token-generator-area');
  const displayArea = document.getElementById('token-display-area');
  const tokenValue = document.getElementById('token-value');
  const countdownEl = document.getElementById('token-countdown');

  let timerInterval;

  btnGenerate.addEventListener('click', () => {
    generatorArea.style.display = 'none';
    displayArea.style.display = 'block';
    tokenValue.textContent = booking.withdrawal_token;
    
    let timeLeft = 60;
    countdownEl.textContent = '01:00';
    
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        displayArea.style.display = 'none';
        generatorArea.style.display = 'block';
        if(typeof showToast === 'function') showToast('O token expirou. Gere novamente.', 'error');
        else alert('O token expirou. Gere novamente.');
      } else {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        countdownEl.textContent = `${m}:${s}`;
      }
    }, 1000);
  });
}
