/* ============================================
   ALUGAKI — Product Detail Page Logic
   Gallery, calendar, booking
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initGallery();
  initCalendar();
  initPriceTabs();
  
  // Atualiza link do checkout com o ID correto
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || '3';
  const ctaBtn = document.querySelector('.booking-cta a');
  if (ctaBtn) {
    ctaBtn.href = `checkout.html?id=${productId}`;
  }

  loadProductDetails(productId);
});

async function loadProductDetails(productId) {
  try {
    const response = await window.AlugakiAPI.products.getById(productId);
    const product = response.data;
    
    // Atualiza título da página
    document.title = `${product.title} — ALUGAKI`;
    
    // Breadcrumb
    const breadcrumbCurrent = document.querySelector('.breadcrumb-current');
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.title;
    
    // Breadcrumb category
    const breadcrumbCatLink = document.getElementById('breadcrumb-category-link');
    if (breadcrumbCatLink && product.category) {
      const catLabel = product.category_label || product.category;
      breadcrumbCatLink.textContent = catLabel.charAt(0).toUpperCase() + catLabel.slice(1);
      breadcrumbCatLink.href = `busca.html?categoria=${product.category}`;
    }
    
    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && product.description) {
      metaDesc.setAttribute('content', product.description.substring(0, 160));
    }
    
    // Titulo Principal
    const titleEl = document.querySelector('.product-title');
    if (titleEl) titleEl.textContent = product.title;
    
    // Rating e Locações
    const ratingEl = document.getElementById('product-rating');
    if (ratingEl && product.rating) {
      ratingEl.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ${product.rating}`;
    }
    const rentalsEl = document.getElementById('product-rentals');
    if (rentalsEl) {
      rentalsEl.textContent = `• ${product.rentals || 0} Locações realizadas`;
    }
    
    // Preços
    const dailyPriceEl = document.querySelector('.price-tab[data-period="daily"] .price-tab-value');
    if (dailyPriceEl) dailyPriceEl.textContent = `R$ ${product.price_per_day}`;
    
    const weeklyPriceEl = document.querySelector('.price-tab[data-period="weekly"] .price-tab-value');
    if (weeklyPriceEl) weeklyPriceEl.textContent = `R$ ${product.price_per_week || (product.price_per_day * 6)}`;
    
    // Descrição
    const descEl = document.querySelector('.description-text');
    if (descEl) descEl.textContent = product.description;
    
    // Imagens
    if (product.images && product.images.length > 0) {
      const mainImg = document.getElementById('gallery-main-img');
      if (mainImg) {
        mainImg.src = product.images[0];
        mainImg.alt = product.title;
      }
      
      const thumbContainer = document.querySelector('.gallery-thumbnails');
      if (thumbContainer) {
        thumbContainer.innerHTML = '';
        product.images.forEach((imgUrl, idx) => {
          if (idx > 3) return; // limit to 4 thumbs
          const div = document.createElement('div');
          div.className = `gallery-thumb ${idx === 0 ? 'active' : ''}`;
          div.dataset.index = idx;
          div.innerHTML = `<img src="${imgUrl}" alt="${product.title}">`;
          thumbContainer.appendChild(div);
        });
        // re-init gallery clicks
        initGallery();
      }
    }
    
    // Proprietário
    if (product.owner) {
      const ownerNameEl = document.querySelector('.owner-name');
      if (ownerNameEl) ownerNameEl.textContent = product.owner.name;
      
      const ownerSinceEl = document.querySelector('.owner-since');
      if (ownerSinceEl) ownerSinceEl.textContent = `Membro desde ${product.owner.member_since || 'Out 2021'}`;
      
      const avatarEl = document.querySelector('.owner-avatar');
      if (avatarEl && product.owner.name) {
        const initials = product.owner.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
        avatarEl.textContent = initials;
      }
    }
    
  } catch (error) {
    console.error('Erro ao carregar detalhes do produto:', error);
  }
}

/**
 * Gallery thumbnail click to swap main image
 */
function initGallery() {
  const thumbnails = document.querySelectorAll('.gallery-thumb');
  const mainImg = document.getElementById('gallery-main-img');
  if (!mainImg || !thumbnails.length) return;

  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      // Remove active from all
      thumbnails.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');

      // Swap main image with animation
      const thumbImg = thumb.querySelector('img');
      if (thumbImg) {
        mainImg.style.opacity = '0';
        mainImg.style.transition = 'opacity 200ms ease';
        setTimeout(() => {
          mainImg.src = thumbImg.src;
          mainImg.alt = thumbImg.alt;
          mainImg.style.opacity = '1';
        }, 200);
      }
    });
  });
}

/**
 * Simple calendar with date selection
 */
function initCalendar() {
  const calendarGrid = document.getElementById('calendar-grid');
  const monthYearEl = document.getElementById('calendar-month-year');
  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');
  const pickupDateEl = document.getElementById('pickup-date');
  const returnDateEl = document.getElementById('return-date');

  if (!calendarGrid || !monthYearEl) return;

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const dayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const todayInit = new Date();
  let currentMonth = todayInit.getMonth();
  let currentYear = todayInit.getFullYear();
  let selectedStart = null;
  let selectedEnd = null;

  function renderCalendar() {
    calendarGrid.innerHTML = '';

    // Day name headers
    dayNames.forEach(name => {
      const span = document.createElement('span');
      span.className = 'calendar-day-name';
      span.textContent = name;
      calendarGrid.appendChild(span);
    });

    monthYearEl.textContent = `${months[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = document.createElement('span');
      day.className = 'calendar-day disabled';
      day.textContent = daysInPrevMonth - i;
      calendarGrid.appendChild(day);
    }

    // Current month days
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const day = document.createElement('span');
      day.className = 'calendar-day';
      day.textContent = d;

      const dateObj = new Date(currentYear, currentMonth, d);

      // Disable past dates
      if (dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        day.classList.add('disabled');
      } else {
        // Check if selected
        if (selectedStart && selectedEnd) {
          if (dateObj.getTime() === selectedStart.getTime() || dateObj.getTime() === selectedEnd.getTime()) {
            day.classList.add('selected');
          } else if (dateObj > selectedStart && dateObj < selectedEnd) {
            day.classList.add('in-range');
          }
        } else if (selectedStart && dateObj.getTime() === selectedStart.getTime()) {
          day.classList.add('selected');
        }

        day.addEventListener('click', () => handleDayClick(dateObj));
      }

      calendarGrid.appendChild(day);
    }
  }

  function handleDayClick(date) {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Start new selection
      selectedStart = date;
      selectedEnd = null;
      if (pickupDateEl) {
        pickupDateEl.textContent = formatDate(date);
      }
      if (returnDateEl) {
        returnDateEl.textContent = 'Escolher data';
      }
    } else {
      // Set end date
      if (date <= selectedStart) {
        selectedStart = date;
        if (pickupDateEl) {
          pickupDateEl.textContent = formatDate(date);
        }
      } else {
        selectedEnd = date;
        if (returnDateEl) {
          returnDateEl.textContent = formatDate(date);
        }
      }
    }
    renderCalendar();
  }

  function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar();
    });
  }

  renderCalendar();
}

/**
 * Price tab toggle (daily/weekly)
 */
function initPriceTabs() {
  const tabs = document.querySelectorAll('.price-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        if (t.classList.contains('weekly')) {
          t.style.background = '';
        }
      });
      tab.classList.add('active');
    });
  });
}
