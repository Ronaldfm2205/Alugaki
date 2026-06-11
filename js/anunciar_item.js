/* ============================================
   ALUGAKI — Lógica de Cadastro de Item
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initPhotoUpload();
  initFormSubmit();
});

let uploadedPhotos = [];

function initPhotoUpload() {
  const photoInput = document.getElementById('item-photos');
  const previewList = document.getElementById('photo-preview-list');

  if (!photoInput || !previewList) return;

  photoInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + uploadedPhotos.length > 5) {
      showToast('Você pode enviar no máximo 5 fotos.', 'error');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedPhotos.push({ file, url: e.target.result });
        renderPreviews();
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    photoInput.value = '';
  });
}

function renderPreviews() {
  const previewList = document.getElementById('photo-preview-list');
  previewList.innerHTML = '';

  uploadedPhotos.forEach((photo, index) => {
    const item = document.createElement('div');
    item.className = 'photo-preview-item';
    item.innerHTML = `
      <img src="${photo.url}" alt="Preview">
      <button type="button" class="photo-remove-btn" data-index="${index}">✕</button>
    `;
    previewList.appendChild(item);
  });

  // Attach remove listeners
  document.querySelectorAll('.photo-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index);
      uploadedPhotos.splice(idx, 1);
      renderPreviews();
    });
  });
}

function initFormSubmit() {
  const form = document.getElementById('form-anunciar');
  const submitBtn = document.getElementById('btn-submit');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (uploadedPhotos.length === 0) {
      showToast('Por favor, adicione pelo menos uma foto.', 'error');
      return;
    }

    const formData = {
      title: document.getElementById('item-title').value,
      category: document.getElementById('item-category').value,
      description: document.getElementById('item-description').value,
      pricePerDay: parseFloat(document.getElementById('item-price').value),
      condition: document.getElementById('item-condition').value,
      location: document.getElementById('item-location').value,
      // For mock purposes we just use the first image dataURL, 
      // in reality we would upload to Supabase Storage.
      images: uploadedPhotos.map(p => p.url)
    };

    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      Publicando...
    `;
    submitBtn.disabled = true;

    try {
      // Create product via API
      await window.AlugakiAPI.post('/products', formData);
      
      showToast('Anúncio publicado com sucesso! 🎉', 'success');
      
      setTimeout(() => {
        window.location.href = 'index.html'; // Redirect to home
      }, 1500);
      
    } catch (err) {
      console.error(err);
      showToast('Erro ao publicar anúncio. Tente novamente.', 'error');
      submitBtn.textContent = 'Publicar Anúncio';
      submitBtn.disabled = false;
    }
  });
}
