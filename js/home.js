/* ============================================
   ALUGAKI — Home Page Logic
   Hero search, smooth scrolling
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeroSearch();
  initSmoothScroll();
  initCategoryHover();
  loadPopularProducts();
});

async function loadPopularProducts() {
  const grid = document.getElementById('popular-grid');
  if (!grid || !window.AlugakiAPI) return;

  try {
    const response = await window.AlugakiAPI.products.list({ limit: 20, ordenar: 'recent' });
    const products = response.data;

    if (products && products.length > 0) {
      grid.innerHTML = ''; // Limpa os itens estáticos
      
      products.forEach(product => {
        const image = (product.images && product.images.length > 0) ? product.images[0] : 'assets/images/placeholder.png';
        const rating = product.rating || '4.9';
        const fav = isFavorite(product.id);
        
        const card = document.createElement('article');
        card.className = 'card-product';
        card.innerHTML = `
          <a href="produto.html?id=${product.id}">
            <div class="card-product-image">
              <img src="${image}" alt="${product.title}" loading="lazy">
              <div class="card-product-rating">
                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ${rating}
              </div>
              <button class="card-product-favorite${fav ? ' active' : ''}" data-product-id="${product.id}" aria-label="Adicionar aos favoritos">
                <svg viewBox="0 0 24 24" fill="${fav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
          </a>
          <div class="card-product-body">
            <h3 class="card-product-title">${product.title}</h3>
            <div class="card-product-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${product.location || 'Brasil'}
            </div>
            <div class="card-product-footer">
              <div class="card-product-price">
                <span class="card-product-price-value">R$ ${product.price_per_day} <span>/dia</span></span>
              </div>
              <a href="produto.html?id=${product.id}" class="btn btn-primary btn-sm">Alugar</a>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
      initCategoryHover(); // re-init hover if necessary
    }
  } catch (error) {
    console.error('Failed to load popular products:', error);
  }
}

/**
 * Hero search form submission
 */
function initHeroSearch() {
  const form = document.getElementById('hero-search-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const input = document.getElementById('hero-search-input');
    if (!input.value.trim()) {
      e.preventDefault();
      input.focus();
      input.style.boxShadow = '0 0 0 2px rgba(186, 26, 26, 0.3)';
      setTimeout(() => { input.style.boxShadow = ''; }, 1500);
    }
  });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/**
 * Category card hover effects (enhanced)
 */
function initCategoryHover() {
  const cards = document.querySelectorAll('.card-category');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const icon = card.querySelector('.card-category-icon');
      if (icon) {
        icon.style.transform = 'scale(1.1) rotate(5deg)';
        icon.style.transition = 'transform 300ms ease';
      }
    });
    card.addEventListener('mouseleave', () => {
      const icon = card.querySelector('.card-category-icon');
      if (icon) {
        icon.style.transform = '';
      }
    });
  });
}
