# 📝 BACKLOG do Projeto ALUGAKI

Este documento reúne ideias, melhorias e novas funcionalidades a serem implementadas nas próximas Sprints.

## Sprint 2 (Próximos Passos)

- [ ] **Migrar Banco para Docker**: Criar `docker-compose.yml` para rodar o PostgreSQL localmente via contêiner. Isso remove a dependência da nuvem (Supabase), resolve o problema de queda por inatividade e impressiona na avaliação da faculdade.
- [ ] **Conteinerização da Aplicação**: Criar `Dockerfile` e `.dockerignore` para padronizar o ambiente de desenvolvimento (Node.js) e facilitar o deploy.
- [ ] **Upload Real de Fotos na Nuvem**: Substituir os caminhos de imagens locais (ex: `assets/images/foto.png`) por um sistema real de upload. Integrar o frontend ao backend com `multer` e enviar os arquivos para o **Supabase Storage** (ou S3/Cloudinary), salvando a URL pública gerada no banco de dados.
- [ ] **Recuperação de Senha**: Criar fluxo de "Esqueci minha senha" com envio de e-mail e token de redefinição.
- [ ] **Sistema de Avaliações**: Permitir que locatários avaliem os itens e os donos, criando notas (estrelas) reais que afetam o ranking na busca.

## Ideias Futuras
- [ ] **Integração de Pagamento**: Adicionar Stripe ou Mercado Pago para processamento de pagamentos reais das reservas.
- [ ] **Chat Integrado**: Sistema de chat em tempo real entre o dono do produto e a pessoa que está alugando.
- [ ] **Mapa / Geolocalização**: Busca de produtos usando mapa interativo, limitando raio de distância.
