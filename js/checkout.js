/* ============================================
   ALUGAKI — Checkout Page Logic
   Payment method selection, card formatting, finalization
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initPaymentMethods();
  initCardFormatting();
  initFinalize();
});

/**
 * Toggle between Credit Card and PIX payment methods
 */
function initPaymentMethods() {
  const cardMethod = document.getElementById('method-card');
  const pixMethod = document.getElementById('method-pix');
  const cardForm = document.getElementById('card-form');

  if (!cardMethod || !pixMethod) return;

  const cardHeader = cardMethod.querySelector('.payment-method-header');
  
  function selectCard() {
    cardMethod.classList.add('active');
    pixMethod.classList.remove('active');
    if (cardForm) cardForm.style.display = '';
    
    // Update PIX radio
    const pixRadio = pixMethod.querySelector('.payment-radio');
    if (pixRadio) {
      pixRadio.innerHTML = '<div class="payment-radio-dot"></div>';
    }
  }

  function selectPix() {
    pixMethod.classList.add('active');
    cardMethod.classList.remove('active');
    if (cardForm) cardForm.style.display = 'none';

    // Add active styling to pix
    pixMethod.style.borderColor = 'var(--primary-container)';
    const pixDot = pixMethod.querySelector('.payment-radio-dot');
    if (pixDot) pixDot.style.transform = 'scale(1)';

    // Remove from card
    const cardDot = cardMethod.querySelector('.payment-radio-dot');
    if (cardDot) cardDot.style.transform = 'scale(0)';
  }

  if (cardHeader) {
    cardHeader.addEventListener('click', selectCard);
  }
  pixMethod.addEventListener('click', selectPix);
}

/**
 * Format credit card input fields
 */
function initCardFormatting() {
  const cardNumber = document.getElementById('card-number');
  const cardExpiry = document.getElementById('card-expiry');
  const cardCvv = document.getElementById('card-cvv');

  if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
      e.target.value = value.substring(0, 19);
    });
  }

  if (cardExpiry) {
    cardExpiry.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value.substring(0, 5);
    });
  }

  if (cardCvv) {
    cardCvv.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });
  }
}

/**
 * Finalize button
 */
function initFinalize() {
  const finalizeBtn = document.getElementById('btn-finalize');
  if (!finalizeBtn) return;

  finalizeBtn.addEventListener('click', () => {
    const isCardActive = document.getElementById('method-card').classList.contains('active');

    if (isCardActive) {
      // Validate card fields
      const number = document.getElementById('card-number');
      const expiry = document.getElementById('card-expiry');
      const cvv = document.getElementById('card-cvv');
      const name = document.getElementById('card-name');

      let valid = true;
      [number, expiry, cvv, name].forEach(field => {
        if (field && !field.value.trim()) {
          field.style.borderColor = '#ba1a1a';
          field.style.boxShadow = '0 0 0 3px rgba(186, 26, 26, 0.1)';
          valid = false;
          setTimeout(() => {
            field.style.borderColor = '';
            field.style.boxShadow = '';
          }, 2000);
        }
      });

      if (!valid) {
        showToast('Preencha todos os campos do cartão', 'error');
        return;
      }
    }

    // Simulate processing
    finalizeBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      Processando...
    `;
    finalizeBtn.disabled = true;

    // Add spin animation
    const style = document.createElement('style');
    style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
    document.head.appendChild(style);

    setTimeout(() => {
      showToast('Aluguel finalizado com sucesso! 🎉', 'success');
      finalizeBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Aluguel Confirmado!
      `;
      finalizeBtn.style.background = '#2e7d32';
    }, 2000);
  });
}
