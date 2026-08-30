document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const forgotForm = document.getElementById('form-forgot-password');
  const resetForm = document.getElementById('form-reset-password');
  const subtitle = document.getElementById('page-subtitle');
  const alertContainer = document.getElementById('alert-container');

  const btnForgot = document.getElementById('btn-forgot');
  const btnReset = document.getElementById('btn-reset');

  function showAlert(message, isError = false) {
    alertContainer.innerHTML = \`<div style="padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem; \${isError ? 'background-color: #fee2e2; color: #b91c1c;' : 'background-color: #dcfce7; color: #15803d;'}">\${message}</div>\`;
  }

  function clearAlert() {
    alertContainer.innerHTML = '';
  }

  // Toggle views based on token
  if (token) {
    forgotForm.style.display = 'none';
    resetForm.style.display = 'block';
    subtitle.textContent = 'Criar Nova Senha';
    document.getElementById('reset-token').value = token;
  } else {
    forgotForm.style.display = 'block';
    resetForm.style.display = 'none';
    subtitle.textContent = 'Recuperação de Senha';
  }

  // Handle Forgot Password (Send Email)
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();

      const email = document.getElementById('forgot-email').value;
      if (!email) {
        showAlert('Por favor, informe seu e-mail.', true);
        return;
      }

      try {
        btnForgot.textContent = 'Enviando...';
        btnForgot.disabled = true;

        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
          showAlert(data.message || 'Se o e-mail existir em nossa base, um link de recuperação foi enviado. (Verifique o terminal para o link em modo dev)');
          forgotForm.reset();
        } else {
          showAlert(data.error || 'Ocorreu um erro ao solicitar a recuperação.', true);
        }
      } catch (err) {
        console.error(err);
        showAlert('Erro de conexão. Tente novamente mais tarde.', true);
      } finally {
        btnForgot.textContent = 'Enviar Link';
        btnForgot.disabled = false;
      }
    });
  }

  // Handle Reset Password
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();

      const newPassword = document.getElementById('reset-password').value;
      const confirmPassword = document.getElementById('reset-password-confirm').value;
      const tokenValue = document.getElementById('reset-token').value;

      if (newPassword.length < 8) {
        showAlert('A nova senha deve ter pelo menos 8 caracteres.', true);
        return;
      }

      if (newPassword !== confirmPassword) {
        showAlert('As senhas não coincidem.', true);
        return;
      }

      try {
        btnReset.textContent = 'Redefinindo...';
        btnReset.disabled = true;

        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenValue, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
          showAlert('Sua senha foi redefinida com sucesso! Redirecionando para o login...');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 3000);
        } else {
          showAlert(data.error || 'Erro ao redefinir a senha.', true);
          btnReset.textContent = 'Redefinir Senha';
          btnReset.disabled = false;
        }
      } catch (err) {
        console.error(err);
        showAlert('Erro de conexão. Tente novamente mais tarde.', true);
        btnReset.textContent = 'Redefinir Senha';
        btnReset.disabled = false;
      }
    });
  }
});
