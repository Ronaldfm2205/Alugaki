/* ============================================
   ALUGAKI — Login / Register Page Logic
   Tab switching, form validation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initLoginTabs();
  initLoginForm();
  initRegisterForm();
  checkHashForTab();
  window.addEventListener('hashchange', checkHashForTab);
});

/**
 * Tab switching between "Entrar" and "Criar Conta"
 */
function initLoginTabs() {
  const tabs = document.querySelectorAll('.login-tab');
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');

  if (!tabs.length || !loginForm || !registerForm) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  const tabs = document.querySelectorAll('.login-tab');
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');

  tabs.forEach(t => t.classList.remove('active'));

  if (tabName === 'entrar') {
    document.getElementById('tab-entrar').classList.add('active');
    loginForm.classList.remove('hidden');
    loginForm.style.display = '';
    registerForm.classList.remove('active');
    registerForm.style.display = 'none';
  } else {
    document.getElementById('tab-criar-conta').classList.add('active');
    loginForm.classList.add('hidden');
    loginForm.style.display = 'none';
    registerForm.classList.add('active');
    registerForm.style.display = 'flex';
  }
}

/**
 * Check URL hash for default tab
 */
function checkHashForTab() {
  if (window.location.hash === '#criar-conta') {
    switchTab('criar-conta');
  } else {
    switchTab('entrar');
  }
}

/**
 * Login form validation & submission
 */
function initLoginForm() {
  const form = document.getElementById('form-login');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');

    // Clear previous errors
    clearErrors(form);

    let valid = true;

    if (!email.value.trim() || !isValidEmail(email.value)) {
      showFieldError(email, 'Informe um e-mail válido');
      valid = false;
    }

    if (!password.value.trim()) {
      showFieldError(password, 'Informe sua senha');
      valid = false;
    }

    const lgpd = document.getElementById('login-lgpd');
    if (lgpd && !lgpd.checked) {
      showFieldError(lgpd, 'Você precisa concordar com os termos perante a LGPD');
      valid = false;
    }

    if (valid) {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Entrando...';
      submitBtn.disabled = true;

      window.AlugakiAPI.auth.login(email.value, password.value)
        .then(response => {
          const userWithToken = { ...response.data, token: response.token };
          localStorage.setItem('alugaki_user', JSON.stringify(userWithToken));
          
          if(typeof showToast === 'function') showToast('Login realizado com sucesso!', 'success');
          
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1000);
        })
        .catch(err => {
          console.error(err);
          showFieldError(password, 'Credenciais inválidas');
          submitBtn.textContent = 'Entrar';
          submitBtn.disabled = false;
        });
    }
  });
}

/**
 * Register form validation & submission
 */
function initRegisterForm() {
  const form = document.getElementById('form-register');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('register-name');
    const email = document.getElementById('register-email');
    const password = document.getElementById('register-password');
    const passwordConfirm = document.getElementById('register-password-confirm');

    clearErrors(form);

    let valid = true;

    if (!name.value.trim()) {
      showFieldError(name, 'Informe seu nome completo');
      valid = false;
    }

    if (!email.value.trim() || !isValidEmail(email.value)) {
      showFieldError(email, 'Informe um e-mail válido');
      valid = false;
    }

    if (!password.value || password.value.length < 8) {
      showFieldError(password, 'A senha deve ter pelo menos 8 caracteres');
      valid = false;
    }

    if (password.value !== passwordConfirm.value) {
      showFieldError(passwordConfirm, 'As senhas não coincidem');
      valid = false;
    }

    const lgpd = document.getElementById('register-lgpd');
    if (lgpd && !lgpd.checked) {
      showFieldError(lgpd, 'Você precisa concordar com os termos perante a LGPD');
      valid = false;
    }

    if (valid) {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Criando conta...';
      submitBtn.disabled = true;

      window.AlugakiAPI.auth.register({
        name: name.value,
        email: email.value,
        password: password.value
      })
      .then(response => {
        const userWithToken = { ...response.data, token: response.token };
        localStorage.setItem('alugaki_user', JSON.stringify(userWithToken));
        
        if(typeof showToast === 'function') showToast('Conta criada com sucesso!', 'success');
        
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      })
      .catch(err => {
        console.error(err);
        showFieldError(email, 'Erro ao criar conta. O e-mail pode já estar em uso.');
        submitBtn.textContent = 'Criar Conta';
        submitBtn.disabled = false;
      });
    }
  });
}

/**
 * Email validation helper
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Show error below a field
 */
function showFieldError(input, message) {
  input.style.borderColor = '#ba1a1a';
  input.style.boxShadow = '0 0 0 3px rgba(186, 26, 26, 0.1)';

  const error = document.createElement('span');
  error.className = 'field-error';
  error.textContent = message;
  error.style.cssText = `
    font-size: 12px;
    color: #ba1a1a;
    margin-top: 4px;
    display: block;
    font-family: 'Inter', sans-serif;
  `;
  input.parentNode.appendChild(error);
}

/**
 * Clear all field errors
 */
function clearErrors(form) {
  form.querySelectorAll('.field-error').forEach(el => el.remove());
  form.querySelectorAll('.input-field').forEach(input => {
    input.style.borderColor = '';
    input.style.boxShadow = '';
  });
}
