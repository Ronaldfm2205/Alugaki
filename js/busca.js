/* ============================================
   ALUGAKI — Search / Busca Page Logic
   Filters, chips, infinite scroll pagination
   ============================================ */

let currentPage = 1;
const ITEMS_PER_PAGE = 15;
let isLoading = false;
let hasMore = true;
let observer = null;

document.addEventListener('DOMContentLoaded', () => {
  initChips();
  initInfiniteScroll();
  initSortSelect();
  initSearchInput();
  initFiltersAndSliders();
  initClearFilters();
  loadSearchResults();
});

function triggerNewSearch() {
  currentPage = 1;
  hasMore = true;
  isLoading = false;
  
  const spinner = document.getElementById('loading-spinner');
  const noMore = document.getElementById('no-more-items');
  if (spinner) spinner.style.display = 'none';
  if (noMore) noMore.style.display = 'none';
  
  loadSearchResults();
}

async function loadSearchResults() {
  if (isLoading || !hasMore) return;

  const grid = document.getElementById('results-grid');
  if (!grid || !window.AlugakiAPI) return;

  isLoading = true;
  const spinner = document.getElementById('loading-spinner');
  const noMore = document.getElementById('no-more-items');
  if (spinner) spinner.style.display = 'block';
  if (noMore) noMore.style.display = 'none';

  const params = { 
    page: currentPage, 
    limit: ITEMS_PER_PAGE 
  };
  
  // Search query
  const searchInput = document.getElementById('search-input');
  if (searchInput && searchInput.value.trim() && searchInput.value.trim() !== 'Ferramentas') {
    params.q = searchInput.value.trim();
  }

  // Categories from DOM
  const checkedCats = Array.from(document.querySelectorAll('.filter-checkbox input:checked')).map(cb => cb.value);
  if (checkedCats.length > 0) {
    params.categoria = checkedCats.join(',');
  }

  // Price from DOM
  const priceMin = document.getElementById('price-min');
  const priceMax = document.getElementById('price-max');
  if (priceMin) params.precoMin = priceMin.value;
  if (priceMax) params.precoMax = priceMax.value;

  // State / Condition
  const activeChips = Array.from(document.querySelectorAll('.filter-chips .chip.active')).map(chip => chip.dataset.state);
  if (activeChips.length > 0) {
    params.estado = activeChips.join(',');
  }

  // Sorting
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    params.ordenar = sortSelect.value;
  }

  try {
    const response = await window.AlugakiAPI.products.list(params);
    const products = response.data;
    
    // Update title (only on first page load or search update)
    if (currentPage === 1) {
      const resultsTitle = document.querySelector('.results-title h1');
      const resultsSubtitle = document.querySelector('.results-title p');
      if (resultsTitle) {
        if (params.q) resultsTitle.textContent = `Resultados para "${params.q}"`;
        else if (params.categoria) resultsTitle.textContent = `Resultados em ${params.categoria}`;
        else resultsTitle.textContent = `Todos os Produtos`;
      }
      if (resultsSubtitle) resultsSubtitle.textContent = `${response.total || products.length} itens encontrados perto de você`;
      
      grid.innerHTML = '';
    }
    
    if (products.length === 0 && currentPage === 1) {
      grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 40px;">Nenhum produto encontrado.</p>';
      if (spinner) spinner.style.display = 'none';
      hasMore = false;
      isLoading = false;
      return;
    }

    products.forEach(product => {
      const image = (product.images && product.images.length > 0) ? product.images[0] : 'assets/images/placeholder.png';
      const rating = product.rating || '4.9';
      const badge = product.id <= 3 ? '<span style="padding:3px 8px;border-radius:var(--rounded-full);font-size:10px;font-weight:700;background:var(--tertiary-container);color:var(--on-tertiary-container);text-transform:uppercase;">DESTAQUE</span>' : '';
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
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <h3 class="card-product-title" style="margin-bottom:0">${product.title}</h3>
            ${badge}
          </div>
          <div class="card-product-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${product.location || 'São Paulo'}
          </div>
          <div class="card-product-footer">
            <div class="card-product-price">
              <span class="card-product-price-label">Por dia</span>
              <span class="card-product-price-value">R$ ${product.price_per_day}</span>
            </div>
            <a href="produto.html?id=${product.id}" class="btn btn-primary btn-sm">Reservar</a>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Check if we loaded all items
    if (products.length < ITEMS_PER_PAGE || (response.page && response.totalPages && response.page >= response.totalPages)) {
      hasMore = false;
      if (noMore) noMore.style.display = 'block';
    } else {
      currentPage++;
    }

  } catch (error) {
    console.error('Failed to load search results:', error);
    if (currentPage === 1) {
      grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--error);">Erro ao buscar produtos.</p>';
    }
  } finally {
    isLoading = false;
    if (spinner) spinner.style.display = 'none';
  }
}

function initChips() {
  const chips = document.querySelectorAll('.filter-chips .chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      triggerNewSearch();
    });
  });
}

/**
 * Initialize Infinite Scroll Observer
 */
function initInfiniteScroll() {
  const sentinel = document.getElementById('load-more-sentinel');
  if (!sentinel) return;

  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading && hasMore) {
      loadSearchResults();
    }
  }, {
    rootMargin: '100px'
  });

  observer.observe(sentinel);
}

/**
 * Initialize Filters and Sliders
 */
function initFiltersAndSliders() {
  // Pre-check category from URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('categoria')) {
    const cat = urlParams.get('categoria');
    const cb = document.querySelector(`.filter-checkbox input[value="${cat}"]`);
    if (cb) {
      document.querySelectorAll('.filter-checkbox input').forEach(c => c.checked = false);
      cb.checked = true;
    }
  }

  // Checkbox listeners
  document.querySelectorAll('.filter-checkbox input').forEach(cb => {
    cb.addEventListener('change', () => triggerNewSearch());
  });

  // Slider listeners
  const priceMin = document.getElementById('price-min');
  const priceMax = document.getElementById('price-max');
  const labelMin = document.getElementById('price-min-label');
  const labelMax = document.getElementById('price-max-label');

  if (priceMin && priceMax) {
    priceMin.addEventListener('input', () => {
      if (parseInt(priceMin.value) > parseInt(priceMax.value)) {
        priceMin.value = priceMax.value;
      }
      if (labelMin) labelMin.textContent = `R$ ${priceMin.value}`;
    });
    
    priceMax.addEventListener('input', () => {
      if (parseInt(priceMax.value) < parseInt(priceMin.value)) {
        priceMax.value = priceMin.value;
      }
      if (labelMax) {
        labelMax.textContent = priceMax.value >= 500 ? 'R$ 500+' : `R$ ${priceMax.value}`;
      }
    });

    priceMin.addEventListener('change', () => triggerNewSearch());
    priceMax.addEventListener('change', () => triggerNewSearch());
  }
}

/**
 * Clear all filters
 */
function initClearFilters() {
  const clearBtn = document.getElementById('btn-clear-filters');
  if (!clearBtn) return;

  clearBtn.addEventListener('click', () => {
    // Uncheck all checkboxes
    document.querySelectorAll('.filter-checkbox input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });

    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    const labelMin = document.getElementById('price-min-label');
    const labelMax = document.getElementById('price-max-label');
    
    if (priceMin) {
      priceMin.value = 0;
      if (labelMin) labelMin.textContent = 'R$ 0';
    }
    if (priceMax) {
      priceMax.value = 500;
      if (labelMax) labelMax.textContent = 'R$ 500+';
    }

    // Reset distance
    const distSelect = document.getElementById('filter-distance');
    if (distSelect) distSelect.selectedIndex = 2; // 15km default

    // Deactivate all chips
    document.querySelectorAll('.filter-chips .chip').forEach(chip => {
      chip.classList.remove('active');
    });

    showToast('Filtros limpos');
    triggerNewSearch();
  });
}

/**
 * Sort select change
 */
function initSortSelect() {
  const sortSelect = document.getElementById('sort-select');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', () => {
    showToast(`Ordenando por: ${sortSelect.options[sortSelect.selectedIndex].text}`);
    triggerNewSearch();
  });
}

/**
 * Search input in header
 */
function initSearchInput() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        // Update results title
        const resultsTitle = document.querySelector('.results-title h1');
        if (resultsTitle) {
          resultsTitle.textContent = `Resultados para "${query}"`;
        }
        showToast(`Buscando: ${query}`);
        triggerNewSearch();
      }
    }
  });
}
