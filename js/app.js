/* ============================================
   ALUGAKI — Global App Initialization
   Shared logic across all pages
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initFavoriteButtons();
});

/**
 * Adds shadow to header on scroll
 */
function initHeaderScroll() {
  const header = document.getElementById('site-header') || document.getElementById('checkout-header');
  if (!header) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 10) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

/**
 * Initializes all favorite heart buttons with toggle behavior
 */
function initFavoriteButtons() {
  const favoriteButtons = document.querySelectorAll('.card-product-favorite, .gallery-favorite');
  favoriteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle('active');

      const svg = btn.querySelector('svg');
      if (btn.classList.contains('active')) {
        svg.setAttribute('fill', 'currentColor');
        // Simple pulse animation
        btn.style.transform = 'scale(1.3)';
        setTimeout(() => { btn.style.transform = ''; }, 200);
      } else {
        svg.setAttribute('fill', 'none');
      }
    });
  });
}

/**
 * Simple toast notification
 */
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    padding: 12px 24px;
    background: ${type === 'error' ? '#ba1a1a' : type === 'success' ? '#2e7d32' : '#2e3132'};
    color: white;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    z-index: 10000;
    opacity: 0;
    transition: all 300ms ease;
    font-family: 'Inter', sans-serif;
  `;

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
