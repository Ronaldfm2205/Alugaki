/* ============================================
   ALUGAKI — Lógica de Edição de Item
   ============================================ */

let productId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Check auth
  const userJson = localStorage.getItem('alugaki_user');
  if (!userJson) {
    window.location.href = 'login.html';
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  productId = urlParams.get('id');
  if (!productId) {
    alert('ID do anúncio não fornecido!');
    window.location.href = 'meus_anuncios.html';
    return;
  }

  // Não precisamos iniciar initPhotoUpload pois a edição de fotos está oculta no MVP
  initFormSubmit();
  initLocationFeatures();
  
  await loadProductData(productId);
});

async function loadProductData(id) {
  try {
    const res = await window.AlugakiAPI.products.getById(id);
    const p = res.data;
    
    document.getElementById('item-title').value = p.title || '';
    document.getElementById('item-category').value = p.category || '';
    document.getElementById('item-description').value = p.description || '';
    document.getElementById('item-price').value = p.price_per_day || '';
    document.getElementById('item-condition').value = p.condition || '';
    document.getElementById('item-location').value = p.location || '';
  } catch (err) {
    console.error(err);
    alert('Erro ao carregar dados do anúncio.');
  }
}

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

    const formData = {
      title: document.getElementById('item-title').value,
      category: document.getElementById('item-category').value,
      description: document.getElementById('item-description').value,
      pricePerDay: parseFloat(document.getElementById('item-price').value),
      condition: document.getElementById('item-condition').value,
      location: document.getElementById('item-location').value
    };

    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      Salvando...
    `;
    submitBtn.disabled = true;

    try {
      // Update product via API
      await window.AlugakiAPI.put(`/products/${productId}`, formData);
      
      if(typeof showToast === 'function') showToast('Anúncio atualizado com sucesso! 🎉', 'success');
      
      setTimeout(() => {
        window.location.href = 'meus_anuncios.html'; // Redirect to dashboard
      }, 1500);
      
    } catch (err) {
      console.error(err);
      if(typeof showToast === 'function') showToast('Erro ao atualizar anúncio. Tente novamente.', 'error');
      submitBtn.textContent = 'Salvar Alterações';
      submitBtn.disabled = false;
    }
  });
}

function initLocationFeatures() {
  const btnBuscarCep = document.getElementById('btn-buscar-cep');
  const inputCep = document.getElementById('item-cep');
  const btnUsarGps = document.getElementById('btn-usar-gps');
  const inputLocation = document.getElementById('item-location');

  if (!btnBuscarCep || !inputCep || !btnUsarGps || !inputLocation) return;

  // CEP Mask
  inputCep.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    e.target.value = value;
  });

  // CEP Fetch
  btnBuscarCep.addEventListener('click', async () => {
    const cep = inputCep.value.replace(/\D/g, '');
    if (cep.length !== 8) {
      if(typeof showToast === 'function') showToast('CEP inválido', 'error');
      return;
    }
    
    btnBuscarCep.disabled = true;
    btnBuscarCep.textContent = '...';
    
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      
      if (data.erro) {
        if(typeof showToast === 'function') showToast('CEP não encontrado', 'error');
      } else {
        const bairro = data.bairro || '';
        const cidade = data.localidade || '';
        const uf = data.uf || '';
        inputLocation.value = bairro ? `${bairro}, ${cidade} - ${uf}` : `${cidade} - ${uf}`;
        if(typeof showToast === 'function') showToast('Localização preenchida pelo CEP!', 'success');
      }
    } catch (err) {
      console.error(err);
      if(typeof showToast === 'function') showToast('Erro ao buscar CEP', 'error');
    } finally {
      btnBuscarCep.disabled = false;
      btnBuscarCep.textContent = 'Buscar';
    }
  });

  // Geolocation
  btnUsarGps.addEventListener('click', () => {
    if (!navigator.geolocation) {
      if(typeof showToast === 'function') showToast('Seu navegador não suporta geolocalização', 'error');
      return;
    }

    const originalText = btnUsarGps.innerHTML;
    btnUsarGps.disabled = true;
    btnUsarGps.innerHTML = 'Aguarde...';

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          
          if (data && data.address) {
            const bairro = data.address.suburb || data.address.neighbourhood || data.address.city_district || '';
            const cidade = data.address.city || data.address.town || data.address.village || '';
            const estado = data.address.state || '';
            
            inputLocation.value = bairro ? `${bairro}, ${cidade}` : `${cidade}, ${estado}`;
            if(typeof showToast === 'function') showToast('Localização preenchida pelo GPS!', 'success');
          } else {
            if(typeof showToast === 'function') showToast('Não foi possível identificar o endereço', 'error');
          }
        } catch (err) {
          console.error(err);
          if(typeof showToast === 'function') showToast('Erro ao buscar endereço via GPS', 'error');
        } finally {
          btnUsarGps.disabled = false;
          btnUsarGps.innerHTML = originalText;
        }
      },
      (error) => {
        console.error(error);
        let msg = 'Erro ao obter localização';
        if (error.code === 1) msg = 'Permissão de localização negada';
        if(typeof showToast === 'function') showToast(msg, 'error');
        btnUsarGps.disabled = false;
        btnUsarGps.innerHTML = originalText;
      }
    );
  });
}
