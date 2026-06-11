/* ============================================
   ALUGAKI — Home Page Logic
   Hero search, smooth scrolling
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeroSearch();
  initSmoothScroll();
  initCategoryHover();
});

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
