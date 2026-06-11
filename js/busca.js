/* ============================================
   ALUGAKI — Search / Busca Page Logic
   Filters, chips, pagination
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initChips();
  initClearFilters();
  initPagination();
  initSortSelect();
  initSearchInput();
});

/**
 * Estado (condition) chip toggle
 */
function initChips() {
  const chips = document.querySelectorAll('.filter-chips .chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
    });
  });
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

    // Reset range sliders
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    if (priceMin) priceMin.value = 0;
    if (priceMax) priceMax.value = 200;

    // Reset distance
    const distSelect = document.getElementById('filter-distance');
    if (distSelect) distSelect.selectedIndex = 2; // 15km default

    // Deactivate all chips
    document.querySelectorAll('.filter-chips .chip').forEach(chip => {
      chip.classList.remove('active');
    });

    showToast('Filtros limpos');
  });
}

/**
 * Pagination buttons
 */
function initPagination() {
  const buttons = document.querySelectorAll('.pagination-btn:not(:disabled)');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      document.querySelectorAll('.pagination-btn').forEach(b => b.classList.remove('active'));
      // Add active to clicked
      if (!btn.querySelector('svg')) {
        btn.classList.add('active');
      }
      // Scroll to top of results
      const resultsContent = document.getElementById('results-content');
      if (resultsContent) {
        resultsContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
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
      }
    }
  });
}
