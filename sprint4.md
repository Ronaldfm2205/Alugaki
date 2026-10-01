# Sprint 4: Checkout Seguro e Handshake de Tokens

## Objetivo
Implementar um sistema de locação anti-fraude que garanta segurança tanto para o Locador (dono do item) quanto para o Locatário (cliente). O fluxo se baseia em retenção de limite de cartão de crédito e dupla validação física via Tokens.

## Funcionalidades a Serem Desenvolvidas

### 1. Checkout com Pagamento "Pré-Aprovado" (Hold de Cartão)
- **Tela de Checkout:** Após escolher o item e as datas, o cliente é direcionado para uma página de revisão e pagamento.
- **Formulário de Cartão:** Coleta cenográfica (MVP) dos dados do cartão de crédito.
- **Regra de Negócio (Hold):** A plataforma faz uma "reserva" do valor total no cartão do cliente. A cobrança não é consolidada na fatura neste momento; o limite é apenas bloqueado.
- **Status Inicial:** O status do aluguel entra como "Aguardando Retirada" e o pagamento como "Pré-Aprovado (Hold)".

### 2. Sistema de Tokens de Dupla Validação (Handshake)
- **Geração de Tokens:** Ao aprovar o hold do cartão, a plataforma gera dois códigos numéricos únicos (ex: PIN de 4 dígitos) vinculados ao aluguel.
  - **Token de Retirada (Cliente):** O cliente recebe um token para entregar ao dono na hora de buscar o item.
  - **Token de Devolução (Dono):** O dono recebe um token para entregar ao cliente na hora da devolução.

### 3. Confirmação Física e Gatilho de Cobrança
- **A Retirada:** No encontro presencial, o Locador solicita o *Token de Retirada* do Cliente.
- **Inserção no Sistema:** O Locador digita esse Token em seu painel (aba "Meus Aluguéis").
- **Gatilho Automático (Captura):** Assim que o Token é validado com sucesso pelo sistema:
  1. O status do aluguel muda para "Em Andamento".
  2. O sistema dispara o comando de **Captura do Pagamento** para a operadora. O valor é finalmente debitado da fatura do cliente.

### 4. A Devolução Segura
- **O Fim do Aluguel:** No dia da devolução, o Cliente devolve o item e solicita o *Token de Devolução* do Locador.
- **Validação:** O Cliente insere o token em seu painel.
- **Conclusão:** O status muda para "Concluído", o locador é notificado, e o fluxo se encerra. Caso haja algum dano ou atraso, o Locador pode acionar o suporte antes de fornecer o token.

## Entregáveis desta Sprint
1. \checkout.html\ (com formulário de cartão).
2. Atualização em \perfil.html\ (seção de Meus Aluguéis com inputs de Tokens).
3. Backend: Novas rotas de API para Checkout, Geração de Tokens e Validação de Tokens.
4. Backend: Simulação de comunicação de Captura de Pagamento no momento da validação do Token de Retirada.

