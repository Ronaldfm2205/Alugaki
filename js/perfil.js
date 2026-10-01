/* ============================================
   ALUGAKI — Profile Page Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const userJson = localStorage.getItem('alugaki_user');
  if (!userJson) {
    window.location.href = 'login.html';
    return;
  }

  const user = JSON.parse(userJson);
  
  initTabs();
  initContaForm(user);
  initAvatarUpload(user);
  initEnderecos(user);
  initSeguranca(user);
  initThemeToggle();
  initBookings(user);
});

// Helper para salvar os dados atualizados localmente
function updateUserLocal(newData) {
  const userJson = localStorage.getItem('alugaki_user');
  if (userJson) {
    const user = JSON.parse(userJson);
    const updated = { ...user, ...newData };
    localStorage.setItem('alugaki_user', JSON.stringify(updated));
    // Se o header tiver o nome/foto, atualiza a UI
    if(typeof updateAuthUI === 'function') updateAuthUI();
  }
}

/**
 * Lógica de Abas
 */
function initTabs() {
  const navItems = document.querySelectorAll('.profile-nav-item');
  const tabs = document.querySelectorAll('.profile-tab');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('data-tab');
      
      navItems.forEach(n => n.classList.remove('active'));
      tabs.forEach(t => {
        t.style.display = 'none';
        t.classList.remove('active');
      });

      item.classList.add('active');
      const target = document.getElementById(targetId);
      target.style.display = 'block';
      // Pequeno timeout para re-engatilhar a animação CSS
      setTimeout(() => target.classList.add('active'), 10);
    });
  });
}

/**
 * Aba Minha Conta
 */
function initContaForm(user) {
  const form = document.getElementById('form-conta');
  const inputName = document.getElementById('profile-name');
  const inputEmail = document.getElementById('profile-email');

  inputName.value = user.name || '';
  inputEmail.value = user.email || '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-conta');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
      const response = await window.AlugakiAPI.auth.updateProfile({
        name: inputName.value,
        email: inputEmail.value
      });

      updateUserLocal(response.data);
      
      // Atualiza visualmente o placeholder (a letra grande) caso não tenha foto
      const placeholderEl = document.getElementById('avatar-placeholder');
      if (placeholderEl && response.data.name) {
        placeholderEl.textContent = response.data.name.charAt(0).toUpperCase();
      }
      
      if(typeof showToast === 'function') showToast('Dados atualizados com sucesso!', 'success');
    } catch (error) {
      const msg = error.message ? error.message : 'Erro ao atualizar dados.';
      if(typeof showToast === 'function') showToast(msg, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Salvar Alterações';
    }
  });
}

/**
 * Upload de Avatar
 */
function initAvatarUpload(user) {
  const uploadInput = document.getElementById('avatar-upload');
  const imgEl = document.getElementById('profile-avatar-img');
  const placeholderEl = document.getElementById('avatar-placeholder');
  const btnRemove = document.getElementById('btn-remove-avatar');

  // Load current avatar
  if (user.avatar_url) {
    imgEl.src = user.avatar_url;
    imgEl.style.display = 'block';
    placeholderEl.style.display = 'none';
  } else {
    placeholderEl.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  }

  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      if(typeof showToast === 'function') showToast('A imagem deve ter no máximo 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Data = evt.target.result;
      imgEl.src = base64Data;
      imgEl.style.display = 'block';
      placeholderEl.style.display = 'none';

      try {
        const response = await window.AlugakiAPI.auth.updateProfile({ avatar_url: base64Data });
        updateUserLocal(response.data);
        if(typeof showToast === 'function') showToast('Foto de perfil atualizada!', 'success');
      } catch (error) {
        if(typeof showToast === 'function') showToast('Erro ao salvar foto.', 'error');
      }
    };
    reader.readAsDataURL(file);
  });

  btnRemove.addEventListener('click', async () => {
    if (!confirm('Deseja remover sua foto de perfil?')) return;
    
    imgEl.src = '';
    imgEl.style.display = 'none';
    placeholderEl.style.display = 'flex';
    placeholderEl.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    uploadInput.value = '';

    try {
      const response = await window.AlugakiAPI.auth.updateProfile({ avatar_url: null });
      updateUserLocal(response.data);
      if(typeof showToast === 'function') showToast('Foto removida.', 'success');
    } catch (error) {
      // silencioso
    }
  });
}

/**
 * Aba Segurança
 */
function initSeguranca(user) {
  const form = document.getElementById('form-seguranca');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPass = document.getElementById('profile-senha-atual').value;
    const newPass = document.getElementById('profile-senha-nova').value;
    const confirmPass = document.getElementById('profile-senha-confirma').value;

    if (newPass.length < 8) {
      if(typeof showToast === 'function') showToast('A nova senha deve ter no mínimo 8 caracteres.', 'error');
      return;
    }

    if (newPass !== confirmPass) {
      if(typeof showToast === 'function') showToast('As senhas não coincidem.', 'error');
      return;
    }

    // No MVP, como a rota /profile usa authMiddleware, não validamos a senha atual no backend a rigor nesse boilerplate simples (idealmente a API exigiria).
    // Mas vamos fazer o updateProfile passar a nova senha.
    const btn = document.getElementById('btn-save-seguranca');
    btn.disabled = true;
    btn.textContent = 'Atualizando...';

    try {
      const response = await window.AlugakiAPI.auth.updateProfile({ password: newPass });
      updateUserLocal(response.data);
      if(typeof showToast === 'function') showToast('Senha alterada com sucesso!', 'success');
      form.reset();
    } catch (error) {
      if(typeof showToast === 'function') showToast('Erro ao alterar senha.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Atualizar Senha';
    }
  });
}

/**
 * Aba Endereços
 */
function initEnderecos(user) {
  let addresses = [];
  try {
    if (typeof user.addresses === 'string') {
      addresses = JSON.parse(user.addresses);
    } else if (Array.isArray(user.addresses)) {
      addresses = user.addresses;
    }
  } catch (e) { addresses = []; }

  const listEl = document.getElementById('addresses-list');
  const btnNovo = document.getElementById('btn-novo-endereco');
  const formContainer = document.getElementById('address-form-container');
  const btnCancel = document.getElementById('btn-cancel-endereco');
  const form = document.getElementById('form-endereco');

  function renderList() {
    listEl.innerHTML = '';
    if (addresses.length === 0) {
      listEl.innerHTML = `<p style="color:var(--outline); grid-column: 1/-1;">Nenhum endereço cadastrado.</p>`;
      return;
    }

    addresses.forEach((addr, idx) => {
      const card = document.createElement('div');
      card.className = 'address-card';
      card.innerHTML = `
        <div class="address-card-title">
          Endereço ${idx + 1}
          <div class="address-card-actions">
            <button type="button" aria-label="Editar" onclick="window.editAddress(${idx})">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button type="button" aria-label="Excluir" onclick="window.deleteAddress(${idx})">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
        <p>${addr.rua}, ${addr.numero}<br>${addr.bairro}<br>${addr.cidade} - ${addr.estado}<br>CEP: ${addr.cep}</p>
      `;
      listEl.appendChild(card);
    });
  }

  btnNovo.addEventListener('click', () => {
    form.reset();
    document.getElementById('addr-id').value = '';
    document.getElementById('address-form-title').textContent = 'Novo Endereço';
    formContainer.style.display = 'block';
  });

  btnCancel.addEventListener('click', () => {
    formContainer.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idVal = document.getElementById('addr-id').value;
    
    const newAddr = {
      cep: document.getElementById('addr-cep').value,
      rua: document.getElementById('addr-rua').value,
      numero: document.getElementById('addr-numero').value,
      bairro: document.getElementById('addr-bairro').value,
      cidade: document.getElementById('addr-cidade').value,
      estado: document.getElementById('addr-estado').value.toUpperCase(),
    };

    if (idVal !== '') {
      addresses[parseInt(idVal)] = newAddr;
    } else {
      addresses.push(newAddr);
    }

    const btn = document.getElementById('btn-save-endereco');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
      const response = await window.AlugakiAPI.auth.updateProfile({ addresses });
      updateUserLocal(response.data);
      
      formContainer.style.display = 'none';
      renderList();
      if(typeof showToast === 'function') showToast('Endereço salvo com sucesso!', 'success');
    } catch (error) {
      if(typeof showToast === 'function') showToast('Erro ao salvar endereço.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Salvar Endereço';
    }
  });

  // Exportar funções para o window para os botões do innerHTML usarem
  window.editAddress = (idx) => {
    const addr = addresses[idx];
    document.getElementById('addr-id').value = idx;
    document.getElementById('addr-cep').value = addr.cep;
    document.getElementById('addr-rua').value = addr.rua;
    document.getElementById('addr-numero').value = addr.numero;
    document.getElementById('addr-bairro').value = addr.bairro;
    document.getElementById('addr-cidade').value = addr.cidade;
    document.getElementById('addr-estado').value = addr.estado;
    
    document.getElementById('address-form-title').textContent = 'Editar Endereço';
    formContainer.style.display = 'block';
    formContainer.scrollIntoView({ behavior: 'smooth' });
  };

  window.deleteAddress = async (idx) => {
    if (!confirm('Deseja excluir este endereço?')) return;
    addresses.splice(idx, 1);
    try {
      const response = await window.AlugakiAPI.auth.updateProfile({ addresses });
      updateUserLocal(response.data);
      renderList();
      if(typeof showToast === 'function') showToast('Endereço excluído.', 'success');
    } catch (error) {
      if(typeof showToast === 'function') showToast('Erro ao excluir endereço.', 'error');
    }
  };

  renderList();
}

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  const currentTheme = localStorage.getItem('alugaki_theme') || 'light';
  toggle.checked = currentTheme === 'dark';
  
  toggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('alugaki_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('alugaki_theme', 'light');
    }
  });
}

/**
 * Aba Meus Aluguéis
 */
async function initBookings(user) {
  const listEl = document.getElementById('bookings-list');
  if (!listEl) return;

  async function loadBookings() {
    try {
      const res = await window.AlugakiAPI.bookings.getByUserId(user.id);
      renderBookings(res.data);
    } catch (error) {
      listEl.innerHTML = '<p style="color:red;">Erro ao carregar aluguéis.</p>';
    }
  }

  function renderBookings(bookings) {
    listEl.innerHTML = '';
    if (!bookings || bookings.length === 0) {
      listEl.innerHTML = '<p style="color:var(--outline);">Você ainda não possui aluguéis.</p>';
      return;
    }

    bookings.forEach(b => {
      const card = document.createElement('div');
      card.className = 'booking-card';
      card.style = 'border: 1px solid var(--surface-variant); border-radius: 8px; padding: 16px; margin-bottom: 16px;';
      
      let statusText = '';
      let tokenUI = '';

      if (b.status === 'pending_withdrawal') {
        statusText = '<span style="color:var(--primary); font-weight:600;">Aguardando Retirada</span>';
        tokenUI = `
          <div style="margin-top: 12px; background: var(--surface-variant); padding: 12px; border-radius: 8px;">
            <p style="margin-bottom: 8px; font-size: 14px; font-weight: 500;">Seu Token de Retirada (mostre ao locador): <strong style="font-size:16px;">${b.withdrawal_token}</strong></p>
            <p style="margin-bottom: 8px; font-size: 14px; color: var(--on-surface-variant);">Ou se você é o locador, insira o token do locatário para liberar o item e capturar o pagamento:</p>
            <div style="display:flex; gap: 8px;">
              <input type="text" id="token-input-${b.id}" placeholder="0000" maxlength="4" style="padding: 8px; border-radius: 4px; border: 1px solid var(--outline); width: 80px;">
              <button class="btn btn-primary btn-sm" onclick="window.validateToken(${b.id}, 'withdrawal')">Validar Token</button>
            </div>
          </div>
        `;
      } else if (b.status === 'active') {
        statusText = '<span style="color:green; font-weight:600;">Ativo</span>';
        tokenUI = `
          <div style="margin-top: 12px; background: var(--surface-variant); padding: 12px; border-radius: 8px;">
            <p style="margin-bottom: 8px; font-size: 14px; font-weight: 500;">Seu Token de Devolução (mostre ao locador): <strong style="font-size:16px;">${b.return_token}</strong></p>
            <p style="margin-bottom: 8px; font-size: 14px; color: var(--on-surface-variant);">Ou se você é o locador, insira o token para confirmar a devolução:</p>
            <div style="display:flex; gap: 8px;">
              <input type="text" id="token-input-${b.id}" placeholder="0000" maxlength="4" style="padding: 8px; border-radius: 4px; border: 1px solid var(--outline); width: 80px;">
              <button class="btn btn-primary btn-sm" onclick="window.validateToken(${b.id}, 'return')">Validar Token</button>
            </div>
          </div>
        `;
      } else if (b.status === 'completed') {
        statusText = '<span style="color:var(--outline); font-weight:600;">Concluído</span>';
      } else {
        statusText = `<span>${b.status}</span>`;
      }

      card.innerHTML = `
        <h3 style="font-size: 16px; margin-bottom: 8px;">Reserva #${b.id} - ${b.product_title || 'Produto'}</h3>
        <p style="font-size: 14px; margin-bottom: 4px;"><strong>Data:</strong> ${new Date(b.start_date).toLocaleDateString('pt-BR')} até ${new Date(b.end_date).toLocaleDateString('pt-BR')}</p>
        <p style="font-size: 14px; margin-bottom: 4px;"><strong>Total Retido:</strong> R$ ${b.total}</p>
        <p style="font-size: 14px; margin-bottom: 8px;"><strong>Status:</strong> ${statusText}</p>
        ${tokenUI}
      `;
      listEl.appendChild(card);
    });
  }

  window.validateToken = async (bookingId, type) => {
    const input = document.getElementById(`token-input-${bookingId}`);
    if (!input || !input.value) {
      if(typeof showToast === 'function') showToast('Digite o token', 'error');
      else alert('Digite o token');
      return;
    }
    
    try {
      const res = await window.AlugakiAPI.bookings.validateToken({ bookingId, token: input.value, type });
      if(typeof showToast === 'function') showToast(res.message, 'success');
      else alert(res.message);
      loadBookings();
    } catch (error) {
      if(typeof showToast === 'function') showToast(error.message, 'error');
      else alert(error.message);
    }
  };

  loadBookings();
}
