document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('support-form');
  const input = document.getElementById('support-message');
  const messagesBox = document.getElementById('support-messages');
  const quickItems = document.querySelectorAll('.help-item');
  const user = JSON.parse(localStorage.getItem('alugaki_user') || 'null');

  if (!user || !user.token) {
    window.location.href = 'login.html';
    return;
  }

  async function loadHistory() {
    try {
      const response = await window.AlugakiAPI.support.getConversations(user.id);
      const conversation = (response?.data || [])[0] || null;
      const messages = conversation?.messages || [
        {
          id: 1,
          sender: 'bot',
          text: 'Olá! Sou o assistente do suporte da ALUGAKI. Como posso ajudar você hoje?',
          createdAt: new Date().toISOString(),
        }
      ];
      renderMessages(messages);
    } catch (error) {
      console.error(error);
      renderMessages([
        {
          id: 1,
          sender: 'bot',
          text: 'Olá! Sou o assistente do suporte da ALUGAKI. Como posso ajudar você hoje?',
          createdAt: new Date().toISOString(),
        }
      ]);
    }
  }

  function renderMessages(messages) {
    if (!messagesBox) return;

    const previousValue = input?.value || '';
    const wasFocused = document.activeElement === input;

    messagesBox.innerHTML = '';

    messages.forEach((message) => {
      const node = document.createElement('div');
      node.className = `message ${message.sender}`;
      node.innerHTML = `
        <span class="message-meta">${message.sender === 'user' ? 'Você' : message.sender === 'support' ? 'Suporte' : 'Bot'}</span>
        <div>${message.text}</div>
      `;
      messagesBox.appendChild(node);
    });

    messagesBox.scrollTop = messagesBox.scrollHeight;

    if (input) {
      input.value = previousValue;
      if (wasFocused) {
        input.focus();
      }
    }
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const payload = { message: text, userId: user.id, userName: user.name, email: user.email, subject: 'Dúvida do usuário' };
    const optimisticMessage = {
      id: Date.now(),
      sender: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    const currentMessages = Array.from(messagesBox?.children || []).length
      ? Array.from(messagesBox.children).map((node) => ({
          id: Date.now() + Math.random(),
          sender: node.classList.contains('support') ? 'support' : node.classList.contains('user') ? 'user' : 'bot',
          text: node.querySelector('div')?.textContent || '',
          createdAt: new Date().toISOString(),
        }))
      : [];

    const nextMessages = [...currentMessages, optimisticMessage];
    renderMessages(nextMessages);

    input.value = '';
    input.disabled = true;

    try {
      await window.AlugakiAPI.support.sendMessage(payload);
      await loadHistory();
    } catch (error) {
      console.error(error);
      renderMessages(currentMessages);
      if (typeof showToast === 'function') showToast('Não foi possível enviar sua mensagem no momento.', 'error');
    } finally {
      input.disabled = false;
      input.focus();
    }
  });

  quickItems.forEach((item) => {
    item.addEventListener('click', () => {
      const message = item.dataset.message;
      if (!message) return;
      input.value = message;
      input.focus();
    });
  });

  loadHistory();
  setInterval(() => {
    loadHistory();
  }, 2500);
});
