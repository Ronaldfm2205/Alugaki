/* ============================================
   ALUGAKI — Contact / Checkout Page Logic
   Load product details and contact lead gen
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  loadProductDetails();
  initPhoneReveal();
  initFalarComLocatario();
});

/**
 * Fetch product details based on URL ID and populate checkout summary
 */
async function loadProductDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  if (!productId) {
    document.getElementById('checkout-item-name').textContent = 'Produto não encontrado';
    return;
  }

  try {
    const response = await window.AlugakiAPI.products.getById(productId);
    const product = response.data;

    document.getElementById('checkout-item-name').textContent = product.title;
    document.getElementById('checkout-item-category').textContent = product.category_label || product.category;

    const price = product.price_per_day;
    const taxa = price * 0.1; // 10%
    const total = price + taxa;

    // Format currency Helper
    const formatBRL = (val) => `R$ ${val.toFixed(2).replace('.', ',')}`;

    document.getElementById('checkout-price-main').textContent = formatBRL(price);
    document.getElementById('checkout-val-aluguel').textContent = formatBRL(price);
    document.getElementById('checkout-val-taxa').textContent = formatBRL(taxa);
    document.getElementById('checkout-val-total').textContent = formatBRL(total);

  } catch (error) {
    console.error('Failed to load product details for checkout:', error);
    document.getElementById('checkout-item-name').textContent = 'Erro ao carregar produto';
  }
}

/**
 * Reveal fake phone number when clicked
 */
function initPhoneReveal() {
  const btn = document.getElementById('btn-reveal-phone');
  const phoneDisplay = document.getElementById('phone-display');

  if (!btn || !phoneDisplay) return;

  btn.addEventListener('click', () => {
    // Generate a random looking brazilian number ending
    const num = Math.floor(1000 + Math.random() * 9000);
    phoneDisplay.textContent = `(11) 99999-${num}`;
    btn.style.display = 'none'; // hide the reveal button
  });
}

/**
 * Main CTA Button - No functionality requested by user yet
 */
function initFalarComLocatario() {
  const btn = document.getElementById('btn-falar-locatario');
  if (!btn) return;

  btn.addEventListener('click', () => {
    console.log('Botão Falar com Locatário clicado. (Funcionalidade pendente conforme solicitação)');
    // No-op for now.
  });
}
