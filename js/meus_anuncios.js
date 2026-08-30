document.addEventListener('DOMContentLoaded', async () => {
  // Check auth
  const userJson = localStorage.getItem('alugaki_user');
  if (!userJson) {
    window.location.href = 'login.html';
    return;
  }

  loadMyAds();
});

async function loadMyAds() {
  const container = document.getElementById('my-ads-list');
  try {
    const response = await window.AlugakiAPI.get('/products/me/list');
    const products = response.data;

    if (products.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Você ainda não tem anúncios</h3>
          <p>Comece a ganhar dinheiro alugando os itens que você não usa todo dia.</p>
          <a href="anunciar_item.html" class="btn btn-primary">Anunciar Agora</a>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(p => {
      let imageUrl = 'assets/images/camera_sony.png'; // fallback
      if (p.images) {
        if (Array.isArray(p.images) && p.images.length > 0) {
          imageUrl = p.images[0];
        } else if (typeof p.images === 'string') {
          if (p.images.startsWith('[')) {
            try {
              const imgs = JSON.parse(p.images);
              if (imgs && imgs.length > 0) imageUrl = imgs[0];
            } catch (e) {}
          } else {
            imageUrl = p.images;
          }
        }
      }

      return `
        <div class="my-ad-card" id="ad-${p.id}">
          <img src="${imageUrl}" alt="${p.title}" class="my-ad-image">
          <div class="my-ad-info">
            <h3 class="my-ad-title">${p.title}</h3>
            <div class="my-ad-meta">Adicionado recentemente</div>
            <div class="my-ad-price">R$ ${p.price_per_day}/dia</div>
          </div>
          <div class="my-ad-actions">
            <button class="btn btn-secondary btn-sm" onclick="editAd(${p.id})">Editar</button>
            <button class="btn btn-sm" style="background: var(--error-container); color: var(--on-error-container);" onclick="deleteAd(${p.id})">Excluir</button>
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error(error);
    container.innerHTML = `<div style="color: var(--error)">Erro ao carregar seus anúncios.</div>`;
  }
}

function editAd(id) {
  window.location.href = `editar_anuncio.html?id=${id}`;
}

async function deleteAd(id) {
  if (!confirm('Tem certeza que deseja excluir este anúncio permanentemente?')) return;

  try {
    await window.AlugakiAPI.delete(`/products/${id}`);
    if(typeof showToast === 'function') showToast('Anúncio excluído!', 'success');
    loadMyAds();
  } catch (error) {
    alert('Erro ao excluir anúncio. Verifique se você tem permissão.');
  }
}
