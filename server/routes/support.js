const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const supportFilePath = path.join(__dirname, '../data/support.json');

function ensureSupportFile() {
  const dir = path.dirname(supportFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(supportFilePath)) {
    const initialState = {
      conversations: [
        {
          id: 1,
          userId: 1,
          userName: 'Ricardo M.',
          email: 'ricardo@email.com',
          subject: 'Pergunta sobre reserva',
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: 1,
              sender: 'user',
              text: 'Como faço para cancelar uma reserva já confirmada?',
              createdAt: new Date().toISOString(),
            },
            {
              id: 2,
              sender: 'bot',
              text: 'Você pode solicitar cancelamento pelo painel de reservas. Em geral, a política de reembolso depende do prazo e do anúncio.',
              createdAt: new Date().toISOString(),
            }
          ]
        }
      ]
    };
    fs.writeFileSync(supportFilePath, JSON.stringify(initialState, null, 2));
  }
}

function readSupportData() {
  ensureSupportFile();
  const raw = fs.readFileSync(supportFilePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    return { conversations: [] };
  }
}

function writeSupportData(data) {
  fs.writeFileSync(supportFilePath, JSON.stringify(data, null, 2));
}

function sanitizeMessageText(text) {
  return String(text || '').trim().slice(0, 1000);
}

function generateBotReply(message) {
  const lower = message.toLowerCase();

  if (lower.includes('cancel') || lower.includes('cancelar')) {
    return 'Para cancelar uma reserva, acesse a área de reservas do seu perfil. Se a solicitação for feita com antecedência, o valor pode ser reembolsado conforme a política do anúncio.';
  }

  if (lower.includes('pagamento') || lower.includes('pagar')) {
    return 'O pagamento é processado antes da confirmação da reserva. Se a cobrança não aparecer, confirme o método de pagamento e tente novamente.';
  }

  if (lower.includes('entrega') || lower.includes('retirada')) {
    return 'A retirada e a entrega do item devem seguir as instruções do anúncio. Caso o proprietário tenha informado uma regra específica, ela precisa ser respeitada.';
  }

  if (lower.includes('segurança') || lower.includes('seguro')) {
    return 'A ALUGAKI prioriza autenticação, autorização e validação de dados. Se algo parecer suspeito, entre em contato com o suporte imediatamente.';
  }

  return 'Entendi. Nossa equipe pode te ajudar com isso. Se sua dúvida persistir, o suporte humano poderá responder em seguida.';
}

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'support', timestamp: new Date().toISOString() });
});

router.get('/conversations', authMiddleware, (req, res) => {
  const data = readSupportData();
  const requestedUserId = req.query.userId ? Number(req.query.userId) : null;

  if (req.userRole === 'support' || req.userRole === 'admin') {
    return res.json({ data: data.conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) });
  }

  const conversations = (data.conversations || []).filter((conversation) => String(conversation.userId) === String(req.userId || requestedUserId));
  return res.json({ data: conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) });
});

router.get('/stats', authMiddleware, (req, res) => {
  if (req.userRole !== 'support' && req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito ao suporte' });
  }

  const data = readSupportData();
  const conversations = data.conversations || [];

  const stats = {
    total: conversations.length,
    open: conversations.filter((ticket) => ticket.status === 'open').length,
    inProgress: conversations.filter((ticket) => ticket.status === 'in_progress').length,
    resolved: conversations.filter((ticket) => ticket.status === 'resolved').length,
  };

  return res.json({ data: stats });
});

router.post('/message', authMiddleware, (req, res) => {
  try {
    const { message, userId, subject = 'Dúvida geral' } = req.body;
    const text = sanitizeMessageText(message);
    const currentUserId = Number(userId || req.userId);
    const currentUserName = req.userName || 'Usuário';

    if (!text) {
      return res.status(400).json({ error: 'Mensagem inválida' });
    }

    const data = readSupportData();
    let conversation = (data.conversations || []).find((ticket) => String(ticket.userId) === String(currentUserId));

    if (!conversation) {
      conversation = {
        id: Date.now(),
        userId: currentUserId,
        userName: currentUserName,
        email: req.email || `${currentUserId}@alugaki.local`,
        subject,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };
      data.conversations.push(conversation);
    }

    conversation.messages.push({
      id: Date.now() + 1,
      sender: 'user',
      text,
      createdAt: new Date().toISOString(),
    });

    const botReply = generateBotReply(text);
    conversation.messages.push({
      id: Date.now() + 2,
      sender: 'bot',
      text: botReply,
      createdAt: new Date().toISOString(),
    });

    conversation.updatedAt = new Date().toISOString();
    conversation.status = conversation.status === 'resolved' ? 'in_progress' : conversation.status || 'open';

    writeSupportData(data);
    return res.json({ message: 'Mensagem enviada com sucesso', data: conversation });
  } catch (error) {
    console.error('Support message error:', error);
    return res.status(500).json({ error: 'Erro ao enviar mensagem de suporte' });
  }
});

router.post('/reply', authMiddleware, (req, res) => {
  try {
    if (req.userRole !== 'support' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Acesso restrito ao atendimento do suporte' });
    }

    const { conversationId, userId, message, status = 'in_progress' } = req.body;
    const text = sanitizeMessageText(message);

    if (!conversationId || !text) {
      return res.status(400).json({ error: 'Conversação e mensagem são obrigatórios' });
    }

    const data = readSupportData();
    const conversation = (data.conversations || []).find((ticket) => String(ticket.id) === String(conversationId) || (userId && String(ticket.userId) === String(userId)));

    if (!conversation) {
      return res.status(404).json({ error: 'Conversação não encontrada' });
    }

    conversation.messages.push({
      id: Date.now(),
      sender: 'support',
      text,
      createdAt: new Date().toISOString(),
    });
    conversation.updatedAt = new Date().toISOString();
    conversation.status = status;

    writeSupportData(data);
    return res.json({ message: 'Resposta enviada com sucesso', data: conversation });
  } catch (error) {
    console.error('Support reply error:', error);
    return res.status(500).json({ error: 'Erro ao responder atendimento' });
  }
});

module.exports = router;
