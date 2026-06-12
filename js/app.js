/* ============================================
   ALUGAKI — Global App Initialization
   Shared logic across all pages
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initFavoriteButtons();
  initHeaderFavorites();
  updateAuthUI();
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
 * Favorites system using localStorage
 */
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('alugaki_favorites') || '[]');
  } catch (e) { return []; }
}

function saveFavorites(favs) {
  localStorage.setItem('alugaki_favorites', JSON.stringify(favs));
}

function toggleFavorite(productId) {
  const favs = getFavorites();
  const idx = favs.indexOf(productId);
  if (idx === -1) {
    favs.push(productId);
    showToast('Adicionado aos favoritos ❤️');
  } else {
    favs.splice(idx, 1);
    showToast('Removido dos favoritos');
  }
  saveFavorites(favs);
  return idx === -1; // true = agora é favorito
}

function isFavorite(productId) {
  return getFavorites().indexOf(productId) !== -1;
}

/**
 * Event delegation for favorite buttons (works with dynamic cards)
 */
function initFavoriteButtons() {
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.card-product-favorite, .gallery-favorite');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const productId = btn.dataset.productId;
    const isNowFav = toggleFavorite(productId);
    const svg = btn.querySelector('svg');

    if (isNowFav) {
      svg.setAttribute('fill', 'currentColor');
      btn.classList.add('active');
      btn.style.transform = 'scale(1.3)';
      setTimeout(() => { btn.style.transform = ''; }, 200);
    } else {
      svg.setAttribute('fill', 'none');
      btn.classList.remove('active');
    }
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

/**
 * Updates header UI if user is logged in
 */
function updateAuthUI() {
  const userJson = localStorage.getItem('alugaki_user');
  if (!userJson) return;

  try {
    const user = JSON.parse(userJson);
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    // Replace login/register buttons with User Menu
    let avatarHtml = `<div style="width: 28px; height: 28px; background: var(--primary-container); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">
          ${user.name.charAt(0).toUpperCase()}
        </div>`;
        
    if (user.avatar_url) {
      avatarHtml = `<img src="${user.avatar_url}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" alt="Avatar">`;
    }

    headerActions.innerHTML = `
      <a href="meus_anuncios.html" class="btn btn-ghost" style="color: var(--on-surface);">Meus Anúncios</a>
      <a href="perfil.html" class="user-menu" style="display: flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer; padding: 6px 12px; background: var(--surface-container); border-radius: var(--rounded-full); text-decoration: none; color: var(--on-surface);">
        ${avatarHtml}
        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px;">${user.name.split(' ')[0]}</span>
      </a>
      <button onclick="logout()" class="btn btn-ghost" style="padding: 6px; color: var(--error);">Sair</button>
    `;

    // Update "Quero Anunciar" CTA button if present on page
    const ctaAnnounceBtn = document.querySelector('.btn-cta-announce');
    if (ctaAnnounceBtn) {
      ctaAnnounceBtn.href = 'anunciar_item.html';
    }
  } catch (e) {
    console.error('Error parsing user data', e);
  }
}

function logout() {
  localStorage.removeItem('alugaki_user');
  window.location.reload();
}

/**
 * Header favorites dropdown panel
 */
function initHeaderFavorites() {
  const btn = document.getElementById('btn-favorites');
  if (!btn) return;

  // Create dropdown
  const dropdown = document.createElement('div');
  dropdown.id = 'favorites-dropdown';
  dropdown.style.cssText = `
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    width: 340px;
    max-height: 420px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--rounded-xl);
    box-shadow: 0 12px 32px rgba(0,0,0,0.12);
    z-index: 1000;
    overflow: hidden;
  `;

  // Position parent relatively
  btn.parentElement.style.position = 'relative';
  btn.parentElement.appendChild(dropdown);

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = dropdown.style.display !== 'none';
    if (isOpen) {
      dropdown.style.display = 'none';
      return;
    }
    await renderFavoritesDropdown(dropdown);
    dropdown.style.display = 'block';
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}

async function renderFavoritesDropdown(dropdown) {
  const favIds = getFavorites();

  // Header
  let html = `<div style="padding:16px 16px 12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
    <h3 style="font-size:1rem;font-weight:700;margin:0;">Meus Favoritos</h3>
    <span style="font-size:0.8rem;color:var(--text-muted);">${favIds.length} ${favIds.length === 1 ? 'item' : 'itens'}</span>
  </div>`;

  if (favIds.length === 0) {
    html += `<div style="padding:40px 16px;text-align:center;color:var(--text-muted);">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:40px;height:40px;margin:0 auto 12px;display:block;opacity:0.4;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      <p style="font-size:0.9rem;">Nenhum favorito ainda</p>
      <p style="font-size:0.8rem;margin-top:4px;">Clique no ❤️ dos produtos para salvar aqui.</p>
    </div>`;
    dropdown.innerHTML = html;
    return;
  }

  // Fetch product details
  html += '<div style="overflow-y:auto;max-height:340px;">';
  
  try {
    for (const id of favIds) {
      try {
        const res = await window.AlugakiAPI.products.getById(id);
        const p = res.data;
        const img = (p.images && p.images.length > 0) ? p.images[0] : 'assets/images/placeholder.png';
        html += `<a href="produto.html?id=${p.id}" style="display:flex;align-items:center;gap:12px;padding:12px 16px;text-decoration:none;color:inherit;border-bottom:1px solid var(--border);transition:background 150ms;" onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background=''">
          <img src="${img}" alt="${p.title}" style="width:56px;height:56px;border-radius:8px;object-fit:cover;flex-shrink:0;">
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.title}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;">${p.category_label || p.category}</div>
          </div>
          <div style="font-weight:700;font-size:0.9rem;color:var(--primary);white-space:nowrap;">R$ ${p.price_per_day}/dia</div>
        </a>`;
      } catch (err) {
        // Product may have been deleted
      }
    }
  } catch (err) {
    html += '<p style="padding:16px;color:var(--error);">Erro ao carregar favoritos</p>';
  }

  html += '</div>';
  dropdown.innerHTML = html;
}
