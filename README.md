# ALUGAKI — Marketplace de Aluguéis entre Pessoas

O **ALUGAKI** é uma plataforma que conecta pessoas que desejam alugar itens temporariamente com pessoas que têm esses itens disponíveis, promovendo economia colaborativa e consumo consciente.

## 🗂️ Estrutura e Organização do Projeto

O projeto está organizado na seguinte estrutura de diretórios e arquivos:

```
Site-alugaki/
├── assets/                 # Imagens utilizadas no site (produtos, banners, ícones)
├── css/                    # Arquivos de estilo (CSS Vanilla)
│   ├── reset.css           # Resets globais de estilos
│   ├── variables.css       # Variáveis (cores, tipografia, espaçamento)
│   ├── components.css      # Estilos de componentes reutilizáveis (botões, cards)
│   └── *.css               # Arquivos de estilo específicos para cada página HTML
├── js/                     # Lógica de Frontend (JavaScript Vanilla)
│   ├── api.js              # Serviço centralizado para chamadas à API (fetch)
│   ├── app.js              # Lógica global (menu, autenticação em frontend, header)
│   └── *.js                # Lógica específica de cada página
├── server/                 # Código do Servidor Backend (Node.js + Express)
│   ├── config/             # Configurações do servidor (Banco de Dados e Segurança)
│   │   ├── db.js           # Conexão com o PostgreSQL usando pg
│   │   └── security.js     # Utilitários de hash (PBKDF2) e geração de tokens
│   ├── data/               # Arquivos de dados estáticos para referência e seeds (db.json)
│   ├── middleware/         # Middlewares Express (ex: auth.js para validar tokens)
│   ├── routes/             # Definição das rotas e endpoints da API REST
│   │   ├── auth.js         # Endpoints de autenticação (/api/auth)
│   │   ├── bookings.js     # Endpoints de reservas (/api/bookings)
│   │   ├── categories.js   # Endpoints de categorias (/api/categories)
│   │   └── products.js     # Endpoints de produtos (/api/products)
│   ├── scripts/            # Scripts utilitários de servidor (ex: migrate.js)
│   └── server.js           # Entry point do Express (inicia o backend)
├── *.html                  # Arquivos das páginas do site (Frontend)
│   ├── index.html          # Página Inicial
│   ├── busca.html          # Página de Pesquisa
│   ├── produto.html        # Detalhes de um Produto
│   ├── login.html          # Login / Registro
│   ├── anunciar_item.html  # Cadastrar um Novo Item
│   ├── checkout.html       # Processo de Reserva
│   └── perfil.html         # Painel do Usuário
├── .env                    # (Não versionado) Variáveis de ambiente (ex: DATABASE_URL)
├── database_dump.sql       # Arquivo de dump SQL para criar tabelas e dados de teste
├── package.json            # Configuração e dependências do projeto (Node.js)
└── seed.js                 # Script alternativo em node para preencher dados via código
```

---

## 🛠️ Requisitos e Dependências

Para rodar o projeto, você vai precisar de:

- **Node.js** v14 ou superior instalado
- **NPM** ou **Yarn** (Gerenciadores de pacotes)
- **PostgreSQL** ou uma conta no **Supabase** (para o Banco de Dados)

### Dependências Node (listadas no `package.json`):
- `express` (servidor)
- `pg` (driver para conexão com banco PostgreSQL)
- `cors` (middleware para tratar origens de requisição cruzada)
- `dotenv` (para carregar variáveis de ambiente)

---

## 🚀 Como Instalar e Configurar

Siga o passo a passo abaixo para rodar o projeto localmente:

### 1. Clone o repositório e acesse a pasta do projeto
```bash
git clone https://github.com/SeuUsuario/Site-alugaki.git
cd Site-alugaki
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configuração do Banco de Dados (.env)
Você precisa configurar as variáveis de ambiente. Crie um arquivo chamado `.env` na raiz do projeto (mesmo local onde fica o `package.json`).

Adicione a seguinte configuração dentro do `.env` (substitua pelos dados do seu PostgreSQL):
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
JWT_SECRET="uma_chave_secreta_para_gerar_tokens"
```
*(Se estiver utilizando o Supabase, utilize a Connection String fornecida por eles).*

### 4. Inicialize as Tabelas e o Banco de Dados
Existem duas formas de criar o esquema do banco e preencher com dados iniciais de teste:

**Opção A) Usando o Dump SQL fornecido:**
Abra o seu gerenciador de PostgreSQL (como pgAdmin ou DBeaver) e rode o conteúdo do arquivo `database_dump.sql` localizado na raiz do projeto.

**Opção B) Usando o script de migração automático:**
Rode o comando abaixo no terminal para executar a migração via Node:
```bash
node server/scripts/migrate.js
```

### 5. Inicie o Servidor
Com tudo configurado e instalado, inicie o backend:
```bash
npm start
```
O servidor será iniciado na porta `3000` (ou a definida em `process.env.PORT`).

---

## 🧪 Como Testar o Projeto

### Pelo Navegador (Frontend)
Com o servidor rodando (`npm start`), abra o navegador e acesse:
👉 **http://localhost:3000**

- **Login de Teste:**  
  Email: `ricardo@email.com`  
  Senha: `12345678`
- **Fluxo Principal:** Busque um produto na Home -> Clique em um produto -> Clique em "Alugar" (será redirecionado para login caso não esteja logado) -> Finalize a reserva no Checkout.

### Testando a API via Terminal (cURL) ou Insomnia/Postman

O backend disponibiliza uma API REST acessível via `/api/...`. Aqui estão alguns comandos para testar os endpoints:

**1. Buscar todos os produtos (GET)**
```bash
curl http://localhost:3000/api/products
```

**2. Buscar um produto específico (GET)**
```bash
curl http://localhost:3000/api/products/1
```

**3. Fazer Login (POST)**
Para autenticar na API e receber o token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "ricardo@email.com", "password": "12345678"}'
```

**4. Criar um Produto (POST) - (Requer Token de Autenticação)**
```bash
curl -X POST http://localhost:3000/api/products \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <SEU_TOKEN_AQUI>" \
     -d '{
       "title": "Produto Teste",
       "description": "Uma descrição",
       "category": "eletronicos",
       "pricePerDay": 50,
       "condition": "bom",
       "location": "São Paulo",
       "images": []
     }'
```
*(Substitua `<SEU_TOKEN_AQUI>` pelo token retornado no comando de Login).*
