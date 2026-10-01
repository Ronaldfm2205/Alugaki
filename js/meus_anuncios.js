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

      let statusHtml = '<div class="my-ad-meta">Adicionado recentemente</div>';
      let cardStyle = '';
      let validateBtnHtml = `<button class="btn btn-primary btn-sm" onclick="toggleTokenUI(${p.id})">Validar Token</button>`;
      
      if (p.booking_status === 'active') {
        const endDateStr = p.booking_end_date ? new Date(p.booking_end_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '';
        statusHtml = `<div class="my-ad-meta" style="color: #fff; font-weight: bold; background: linear-gradient(90deg, #10b981, #34d399); padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 4px;">ALUGADO ATÉ ${endDateStr}</div>`;
        cardStyle = 'border: 2px solid #10b981; box-shadow: 0 4px 12px rgba(16,185,129,0.2);';
        validateBtnHtml = `<button class="btn btn-primary btn-sm" onclick="toggleTokenUI(${p.id})">Devolução (Token)</button>`;
      } else if (p.booking_status === 'pending_withdrawal') {
        statusHtml = `<div class="my-ad-meta" style="color: #fff; font-weight: bold; background: linear-gradient(90deg, #f59e0b, #fbbf24); padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 4px;">AGUARDANDO RETIRADA</div>`;
        cardStyle = 'border: 2px solid #f59e0b;';
      }

      return `
        <div class="my-ad-card" id="ad-${p.id}" style="${cardStyle}">
          <img src="${imageUrl}" alt="${p.title}" class="my-ad-image">
          <div class="my-ad-info">
            <h3 class="my-ad-title" style="margin-bottom: 4px;">${p.title}</h3>
            ${statusHtml}
            <div class="my-ad-price" style="margin-top: 8px;">R$ ${p.price_per_day}/dia</div>
          </div>
          <div class="my-ad-actions" style="flex-direction: column; align-items: flex-end;">
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="editAd(${p.id})">Editar</button>
              ${validateBtnHtml}
              <button class="btn btn-sm" style="background: var(--error-container); color: var(--on-error-container);" onclick="deleteAd(${p.id})">Excluir</button>
            </div>
            
            <div id="token-ui-${p.id}" style="display: none; margin-top: 12px; background: rgba(124, 58, 237, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(124, 58, 237, 0.3); width: 100%;">
              <p style="font-size: 13px; margin-bottom: 8px; font-weight: 500; color: #d8b4fe;">Digite o token fornecido pelo cliente:</p>
              <div style="display: flex; gap: 8px; width: 100%;">
                <input type="text" id="token-input-${p.id}" maxlength="4" placeholder="0000" style="flex: 1; padding: 8px; text-align: center; border-radius: 6px; border: 2px solid var(--primary); background: rgba(0,0,0,0.2); color: #fff; font-size: 18px; letter-spacing: 6px; font-weight: bold; outline: none;">
                <button class="btn btn-primary btn-sm" onclick="confirmValidateToken(${p.id})">Confirmar</button>
              </div>
            </div>
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

window.toggleTokenUI = function(productId) {
  const ui = document.getElementById(`token-ui-${productId}`);
  if (ui) {
    ui.style.display = ui.style.display === 'none' ? 'block' : 'none';
  }
}

window.confirmValidateToken = async function(productId) {
  const input = document.getElementById(`token-input-${productId}`);
  const token = input ? input.value : null;
  
  if (!token) {
    if(typeof showToast === 'function') showToast('Digite o token', 'error');
    else alert('Digite o token');
    return;
  }
  
  try {
    const res = await window.AlugakiAPI.bookings.validateByProduct({
      productId,
      token
    });
    if(typeof showToast === 'function') showToast(res.message, 'success');
    else alert(res.message);
    
    // Atualiza a tela para exibir o novo status visual ("Alugado até...")
    loadMyAds();
  } catch (error) {
    if(typeof showToast === 'function') showToast(error.message, 'error');
    else alert(error.message);
  }
}
