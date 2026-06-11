/* ============================================
   ALUGAKI — Product Detail Page Logic
   Gallery, calendar, booking
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initGallery();
  initCalendar();
  initPriceTabs();
});

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

  let currentMonth = 9; // October (0-indexed)
  let currentYear = 2024;
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
