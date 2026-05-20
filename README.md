# Compras na 25 🛍️

MVP - Agregador de preços de compras

## 📱 Projeto Completo

Compras na 25 é uma aplicação web moderna que agrega preços de produtos de diferentes lojas online brasileiras, permitindo que usuários encontrem as melhores ofertas em um só lugar com alertas de preço, favoritos e comparação em tempo real.

## ✨ Features Implementadas

### 🔐 Autenticação
- ✅ Registro de usuários com validação
- ✅ Login seguro com JWT
- ✅ Hash de senhas com bcrypt
- ✅ Proteção de rotas

### 🛒 Produtos e Preços
- ✅ Listagem de produtos
- ✅ Busca em tempo real
- ✅ Comparação de preços por loja
- ✅ Filtro por melhor oferta

### 📊 Dashboard
- ✅ Comparador visual de preços
- ✅ Estatísticas (menor, maior, economia)
- ✅ Links diretos para comprar
- ✅ Interface responsiva

### 🕷️ Web Scraping
- ✅ Mercado Livre
- ✅ Amazon
- ✅ Shopee
- ✅ B2Brazil
- ✅ Kalunga
- ✅ Atualização automática a cada hora

### 🔔 Notificações
- ✅ Sistema de notificações em tempo real
- ✅ Histórico de notificações
- ✅ Marcar como lido
- ✅ Deletar notificações

### 🚨 Alertas de Preço
- ✅ Criar alertas customizados por produto
- ✅ Definir preço alvo
- ✅ Notificações automáticas
- ✅ Gerenciar múltiplos alertas
- ✅ Status em tempo real

### ⭐ Favoritos
- ✅ Adicionar/remover favoritos
- ✅ Listar todos os favoritos
- ✅ Comparação rápida de favoritos
- ✅ Sincronização em tempo real

### 📱 Interface
- ✅ Design responsivo (mobile, tablet, desktop)
- ✅ Dark mode ready
- ✅ Navegação intuitiva
- ✅ Ícones e visuais modernos

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14** - Framework React moderno
- **React 18** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Axios** - HTTP client

### Backend
- **Fastify** - Fast HTTP server
- **Node.js 18+** - Runtime
- **TypeScript** - Type safety
- **Prisma ORM** - Database ORM
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Zod** - Validação

### Banco de Dados
- **PostgreSQL 15** - Banco relacional
- **Prisma Migrations** - Versionamento do schema

### Web Scraping
- **Playwright** - Browser automation
- **Prisma Client** - Salvar dados

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração

## 📁 Estrutura do Projeto

```
compras-na-25/
├── apps/
│   ├── frontend/                  # Next.js application
│   │   ├── src/pages/
│   │   │   ├── index.tsx         # Home
│   │   │   ├── dashboard.tsx     # Comparador
│   │   │   ├── notifications.tsx # Notificações
│   │   │   ├── price-alerts.tsx  # Alertas
│   │   │   ├── favorites.tsx     # Favoritos
│   │   │   ├── login.tsx         # Login
│   │   │   └── signup.tsx        # Registro
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── backend/                   # Fastify API
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts       # Autenticação
│   │   │   │   ├── notifications.ts
│   │   │   │   ├── price-alerts.ts
│   │   │   │   └── favorites.ts
│   │   │   ├── utils/
│   │   │   │   ├── password.ts   # Hash
│   │   │   │   └── validation.ts # Validação
│   │   │   └── index.ts          # Main
│   │   └── package.json
│   │
│   └── scraper/                   # Playwright scraper
│       ├── src/
│       │   ├── scrapers.ts        # 5 scrapers
│       │   └── index.ts           # Main
│       └── package.json
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── .env.example
│
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── package.json
├── README.md
└── .gitignore
```

## 🚀 Como Rodar

### Opção 1: Com Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/cyberTavico/compras-na-25.git
cd compras-na-25

# Inicie os serviços
docker-compose up
```

Acesse:
- 🌐 Frontend: http://localhost:3000
- 🔌 API: http://localhost:3001
- 🏥 Health: http://localhost:3001/health

### Opção 2: Local (Para Desenvolvimento)

```bash
# Install dependencies
npm install
npm install --workspace=apps/frontend
npm install --workspace=apps/backend
npm install --workspace=apps/scraper

# Terminal 1 - Database
docker run -d \
  --name compras_postgres \
  -e POSTGRES_USER=compras \
  -e POSTGRES_PASSWORD=compras_password \
  -e POSTGRES_DB=compras_na_25 \
  -p 5432:5432 \
  postgres:15-alpine

# Terminal 2 - Backend
cd apps/backend
npx prisma migrate dev
npm run dev

# Terminal 3 - Frontend
cd apps/frontend
npm run dev

# Terminal 4 - Scraper (opcional)
cd apps/scraper
npm run scrape
```

## 📊 Modelos de Dados

### User
```
- id: CUID
- email: String (único)
- password: String (hash)
- name: String
- favorites: Product[]
- priceAlerts: PriceAlert[]
- notifications: Notification[]
```

### Product
```
- id: CUID
- name: String
- description: String (opcional)
- prices: Price[]
- favoritedBy: User[]
- priceAlerts: PriceAlert[]
```

### Store
```
- id: CUID
- name: String (único)
- url: String
- prices: Price[]
```

### Price
```
- id: CUID
- productId: String (FK)
- storeId: String (FK)
- price: Float
- url: String
- createdAt, updatedAt
```

### PriceAlert
```
- id: CUID
- userId: String (FK)
- productId: String (FK)
- targetPrice: Float
- isActive: Boolean
```

### Notification
```
- id: CUID
- userId: String (FK)
- title: String
- message: String
- type: PRICE_DROP | PRICE_ALERT | NEW_PRODUCT | FLASH_SALE | GENERIC
- isRead: Boolean
- metadata: Json
```

## 🔌 API Endpoints

### Autenticação
- `POST /auth/signup` - Criar conta
- `POST /auth/login` - Fazer login
- `GET /auth/me` - Dados do usuário (protegido)
- `POST /auth/logout` - Logout

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/search?q=termo` - Buscar
- `GET /api/products/:productId/prices` - Preços

### Lojas
- `GET /api/stores` - Listar lojas

### Alertas de Preço
- `POST /api/price-alerts` - Criar alerta (protegido)
- `GET /api/price-alerts` - Listar alertas (protegido)
- `PATCH /api/price-alerts/:id` - Atualizar (protegido)
- `DELETE /api/price-alerts/:id` - Deletar (protegido)

### Notificações
- `GET /api/notifications` - Listar (protegido)
- `PATCH /api/notifications/:id/read` - Marcar lida (protegido)
- `PATCH /api/notifications/mark-all-read` - Marcar todas (protegido)
- `DELETE /api/notifications/:id` - Deletar (protegido)

### Favoritos
- `POST /api/favorites/:productId` - Adicionar (protegido)
- `GET /api/favorites` - Listar (protegido)
- `DELETE /api/favorites/:productId` - Remover (protegido)
- `GET /api/favorites/:productId/check` - Verificar (protegido)

## 🎨 Páginas Frontend

### Home (`/`)
- Busca de produtos
- Listagem com menor preço
- Links para autenticação

### Dashboard (`/dashboard`)
- Comparador de preços lado a lado
- Estatísticas (menor, maior, economia)
- Links para comprar

### Notificações (`/notifications`)
- Histórico de notificações
- Marcar como lido
- Filtrar não lidas

### Alertas de Preço (`/price-alerts`)
- Criar alertas
- Listar alertas
- Status em tempo real
- Deletar alertas

### Favoritos (`/favorites`)
- Listar favoritos
- Comparação rápida
- Remover favoritos

### Login (`/login`)
- Formulário de login
- Link para criar conta
- Validação em tempo real

### Registro (`/signup`)
- Formulário de registro
- Validação de senhas
- Link para login

## 🔄 Fluxo de Dados

```
1. Usuário acessa /
2. Frontend busca produtos da API
3. API retorna lista com preços
4. Usuário clica em produto
5. Vai para /dashboard
6. Dashboard mostra comparação de preços
7. Usuário pode adicionar alerta ou favorito
8. Sistema notifica sobre mudanças
9. Scraper atualiza preços a cada hora
```

## 📈 Próximas Features

- [ ] Email notifications
- [ ] Gráficos de histórico de preços
- [ ] Compartilhar alertas
- [ ] Extensão do navegador
- [ ] Aplicativo mobile (React Native)
- [ ] API rate limiting
- [ ] Cache com Redis
- [ ] Search com Elasticsearch
- [ ] Recomendações com ML

## 🤝 Contribuindo

Sugestões e PRs são bem-vindas!

## 📝 License

MIT

## 👨‍💻 Desenvolvido com ❤️

Se você achou útil, dê uma ⭐️!
