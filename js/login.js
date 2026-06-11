/* ============================================
   ALUGAKI — Login / Register Page Logic
   Tab switching, form validation
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initLoginTabs();
  initLoginForm();
  initRegisterForm();
  checkHashForTab();
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

    if (valid) {
      // Simulate login
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Entrando...';
      submitBtn.disabled = true;

      setTimeout(() => {
        showToast('Login realizado com sucesso!', 'success');
        submitBtn.textContent = 'Entrar';
        submitBtn.disabled = false;

        // Redirect to home
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }, 1500);
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

    if (valid) {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Criando conta...';
      submitBtn.disabled = true;

      setTimeout(() => {
        showToast('Conta criada com sucesso!', 'success');
        submitBtn.textContent = 'Criar Conta';
        submitBtn.disabled = false;

        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }, 1500);
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
