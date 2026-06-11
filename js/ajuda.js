/* ============================================
   ALUGAKI — Ajuda (Lógica do Chatbot IA)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initChat();
});

function initChat() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const messagesContainer = document.getElementById('chat-messages');
  const suggestions = document.querySelectorAll('.suggestion-chip');

  // Adiciona evento nas sugestões
  suggestions.forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.textContent;
      sendMessage(text);
      chip.style.display = 'none'; // Esconde a sugestão após uso
    });
  });

  // Envio pelo form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
      sendMessage(text);
      input.value = '';
    }
  });

  function sendMessage(text) {
    // 1. Adiciona a mensagem do usuário
    appendUserMessage(text);
    
    // 2. Mostra indicador de digitação da IA
    const typingId = showTypingIndicator();
    
    // 3. Simula tempo de resposta e gera resposta da IA
    setTimeout(() => {
      removeTypingIndicator(typingId);
      const reply = generateAiResponse(text);
      appendAiMessage(reply);
    }, 1500 + Math.random() * 1000); // 1.5s a 2.5s
  }

  function appendUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'message user-message';
    div.innerHTML = `
      <div class="message-avatar">VC</div>
      <div class="message-bubble">
        <p>${text}</p>
      </div>
    `;
    messagesContainer.appendChild(div);
    scrollToBottom();
  }

  function appendAiMessage(htmlContent) {
    const div = document.createElement('div');
    div.className = 'message ai-message';
    div.innerHTML = `
      <div class="message-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M4 14a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="8" y1="18" x2="8" y2="18"/><line x1="16" y1="18" x2="16" y2="18"/></svg>
      </div>
      <div class="message-bubble">
        ${htmlContent}
      </div>
    `;
    messagesContainer.appendChild(div);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'message ai-message';
    div.id = id;
    div.innerHTML = `
      <div class="message-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M4 14a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="8" y1="18" x2="8" y2="18"/><line x1="16" y1="18" x2="16" y2="18"/></svg>
      </div>
      <div class="message-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    messagesContainer.appendChild(div);
    scrollToBottom();
    return id;
  }

  function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // --- Respostas mockadas simples ---
  function generateAiResponse(input) {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('seguro')) {
      return `<p>O <strong>Seguro ALUGAKI</strong> protege todos os itens contra danos acidentais ou roubo durante o período de locação.</p><p>A taxa de proteção (geralmente 10%) já está inclusa no valor total apresentado no momento do checkout.</p>`;
    }
    if (lowerInput.includes('cadastrar') || lowerInput.includes('anunciar')) {
      return `<p>Para cadastrar um produto, siga estes passos:</p>
              <ol>
                <li>Faça login na sua conta.</li>
                <li>Clique em <strong>Anunciar Item</strong> no menu superior.</li>
                <li>Preencha as informações (título, preço, categoria).</li>
                <li>Adicione boas fotos.</li>
                <li>Clique em Publicar!</li>
              </ol>`;
    }
    if (lowerInput.includes('pagamento') || lowerInput.includes('cartão') || lowerInput.includes('pix')) {
      return `<p>Aceitamos as seguintes formas de pagamento:</p>
              <ul>
                <li>Cartão de Crédito (até 3x sem juros)</li>
                <li>PIX (Aprovação imediata)</li>
              </ul>
              <p>O valor só é repassado ao dono do item após a devolução segura do produto.</p>`;
    }
    
    // Resposta padrão fallback
    return `<p>Não tenho certeza se entendi completamente. 😕</p>
            <p>Ainda estou em treinamento. Você pode tentar reformular a pergunta ou entrar em contato direto com o suporte humano pelo e-mail <strong>suporte@alugaki.com.br</strong>.</p>`;
  }
}
