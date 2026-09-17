document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('alugaki_user') || 'null');
  if (!user || !user.token) {
    window.location.href = 'login.html';
    return;
  }

  if (user.role !== 'support' && user.role !== 'admin') {
    document.getElementById('tickets').innerHTML = '<div class="empty">Acesso restrito ao painel de suporte.</div>';
    return;
  }

  async function renderStats() {
    const stats = await window.AlugakiAPI.support.stats();
    const data = stats?.data || {};
    document.getElementById('stat-total').textContent = data.total || 0;
    document.getElementById('stat-open').textContent = data.open || 0;
    document.getElementById('stat-in-progress').textContent = data.inProgress || 0;
    document.getElementById('stat-resolved').textContent = data.resolved || 0;
  }

  async function renderTickets() {
    if (document.activeElement instanceof HTMLInputElement && document.activeElement.classList.contains('reply-input')) {
      return;
    }

    const response = await window.AlugakiAPI.support.getConversations();
    const tickets = response?.data || [];
    const container = document.getElementById('tickets');

    if (!tickets.length) {
      container.innerHTML = '<div class="empty">Nenhuma conversa pendente no momento.</div>';
      return;
    }

    container.innerHTML = tickets.map((ticket) => `
      <article class="ticket">
        <div class="ticket-header">
          <div>
            <strong>${ticket.userName || 'Usuário'}</strong><br>
            <span style="color: var(--muted);">${ticket.email || 'sem e-mail'}</span>
          </div>
          <div class="status ${ticket.status || 'open'}">${ticket.status === 'in_progress' ? 'em andamento' : ticket.status === 'resolved' ? 'resolvida' : 'aberta'}</div>
        </div>
        <div><strong>Assunto:</strong> ${ticket.subject || 'Dúvida geral'}</div>
        <div class="messages">
          ${(ticket.messages || []).map((message) => `
            <div class="message"><strong>${message.sender === 'support' ? 'Suporte' : message.sender === 'user' ? 'Usuário' : 'Bot'}:</strong> ${message.text}</div>
          `).join('')}
        </div>
        <div class="reply-box">
          <input type="text" class="reply-input" data-id="${ticket.id}" placeholder="Responder ao usuário..." />
          <button data-id="${ticket.id}" class="reply-btn">Responder</button>
        </div>
      </article>
    `).join('');

    document.querySelectorAll('.reply-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        const input = document.querySelector(`.reply-input[data-id="${id}"]`);
        const value = input.value.trim();
        if (!value) return;

        await window.AlugakiAPI.support.reply({ conversationId: Number(id), message: value, status: 'in_progress' });
        await renderStats();
        await renderTickets();
      });
    });
  }

  await renderStats();
  await renderTickets();
  setInterval(async () => {
    const activeReplyInput = document.activeElement instanceof HTMLInputElement && document.activeElement.classList.contains('reply-input');
    if (activeReplyInput) return;

    await renderStats();
    await renderTickets();
  }, 2500);
});
