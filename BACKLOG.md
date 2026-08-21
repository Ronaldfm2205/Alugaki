# 📝 BACKLOG do Projeto ALUGAKI

Este documento reúne ideias, melhorias e novas funcionalidades a serem implementadas nas próximas Sprints.

## Sprint 2 (Próximos Passos)

- [ ] **Conteinerização com Docker**: Criar `Dockerfile` e `.dockerignore` para padronizar o ambiente de desenvolvimento e facilitar o deploy, permitindo que a aplicação rode de forma isolada e idêntica em qualquer máquina.
- [ ] **Upload Real de Fotos na Nuvem**: Substituir os caminhos de imagens locais (ex: `assets/images/foto.png`) por um sistema real de upload. Integrar o frontend ao backend com `multer` e enviar os arquivos para o **Supabase Storage** (ou S3/Cloudinary), salvando a URL pública gerada no banco de dados.
- [ ] **Recuperação de Senha**: Criar fluxo de "Esqueci minha senha" com envio de e-mail e token de redefinição.
- [ ] **Sistema de Avaliações**: Permitir que locatários avaliem os itens e os donos, criando notas (estrelas) reais que afetam o ranking na busca.
- [ ] **Deploy de Produção**: Subir o Backend no Render (ou similar) e conectar o Frontend configurado com as variáveis de ambiente apontando para a API em produção em vez de `localhost:3000`.

## Ideias Futuras
- [ ] **Integração de Pagamento**: Adicionar Stripe ou Mercado Pago para processamento de pagamentos reais das reservas.
- [ ] **Chat Integrado**: Sistema de chat em tempo real entre o dono do produto e a pessoa que está alugando.
- [ ] **Mapa / Geolocalização**: Busca de produtos usando mapa interativo, limitando raio de distância.
