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
      try {
        const imgs = JSON.parse(p.images);
        if (imgs && imgs.length > 0) imageUrl = imgs[0];
      } catch (e) {}

      return `
        <div class="my-ad-card" id="ad-${p.id}">
          <img src="${imageUrl}" alt="${p.title}" class="my-ad-image">
          <div class="my-ad-info">
            <h3 class="my-ad-title">${p.title}</h3>
            <div class="my-ad-meta">Adicionado recentemente</div>
            <div class="my-ad-price">R$ ${p.price_per_day}/dia</div>
          </div>
          <div class="my-ad-actions">
            <button class="btn btn-secondary btn-sm" onclick="editAd(${p.id}, '${p.title.replace(/'/g, "\\'")}', ${p.price_per_day})">Editar</button>
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

async function editAd(id, currentTitle, currentPrice) {
  const newTitle = prompt('Novo título do anúncio:', currentTitle);
  if (!newTitle) return;
  const newPrice = prompt('Novo preço por dia (R$):', currentPrice);
  if (!newPrice || isNaN(newPrice)) return;

  try {
    await window.AlugakiAPI.put(`/products/${id}`, { title: newTitle, pricePerDay: parseInt(newPrice) });
    if(typeof showToast === 'function') showToast('Anúncio atualizado com sucesso!', 'success');
    loadMyAds(); // recarrega lista
  } catch (error) {
    alert('Erro ao atualizar anúncio. Verifique se você tem permissão.');
  }
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
