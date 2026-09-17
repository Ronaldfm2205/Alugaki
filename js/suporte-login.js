document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-support-login');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailInput = document.getElementById('support-email');
    const passwordInput = document.getElementById('support-password');
    const submitBtn = form.querySelector('button[type="submit"]');

    clearErrors(form);

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError(emailInput, 'Informe um e-mail válido.');
      return;
    }

    if (!password) {
      showFieldError(passwordInput, 'Informe a senha.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Entrando...';

    try {
      const response = await window.AlugakiAPI.auth.login(email, password);
      const userWithToken = { ...response.data, token: response.token };
      localStorage.setItem('alugaki_user', JSON.stringify(userWithToken));
      window.location.href = 'suporte_admin.html';
    } catch (error) {
      console.error(error);
      showFieldError(passwordInput, 'Credenciais inválidas para o suporte.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Entrar no painel';
    }
  });
});

function showFieldError(input, message) {
  input.style.borderColor = '#ff8a8a';
  input.style.boxShadow = '0 0 0 3px rgba(255, 138, 138, 0.12)';

  const error = document.createElement('span');
  error.className = 'field-error';
  error.textContent = message;
  input.parentNode.appendChild(error);
}

function clearErrors(form) {
  form.querySelectorAll('.field-error').forEach((el) => el.remove());
  form.querySelectorAll('input').forEach((input) => {
    input.style.borderColor = '';
    input.style.boxShadow = '';
  });
}
