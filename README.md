# Compras na 25 🛍️

MVP - Agregador de preços de compras

## Projeto

Compras na 25 é uma aplicação web que agrega preços de produtos de diferentes lojas online, permitindo que usuários encontrem as melhores ofertas em um só lugar.

## Stack Tecnológico

- **Frontend**: Next.js + React + TailwindCSS + Axios
- **Backend**: Fastify + Node.js
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Web Scraping**: Playwright
- **Containerização**: Docker + Docker Compose

## Estrutura do Projeto

```
compras-na-25/
├── apps/
│   ├── frontend/          # Next.js application
│   ├── backend/           # Fastify API server
│   └── scraper/           # Playwright web scraper
├── prisma/
│   └── schema.prisma      # Database schema
├── docker-compose.yml     # Docker services configuration
└── README.md
```

## Requisitos

- Node.js 18+
- Docker e Docker Compose
- PostgreSQL (opcional se usar Docker)

## Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/cyberTavico/compras-na-25.git
cd compras-na-25
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

#### Backend (`.env`)
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://compras:compras_password@localhost:5432/compras_na_25"
```

#### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Execute com Docker Compose (Recomendado)

```bash
docker-compose up
```

Isso vai iniciar:
- PostgreSQL no porta 5432
- Backend Fastify no porta 3001
- Frontend Next.js no porta 3000

### 5. Ou execute localmente

#### Terminal 1 - Database
```bash
docker-compose up postgres
```

#### Terminal 2 - Backend
```bash
cd apps/backend
npm install
npx prisma migrate dev
npm run dev
```

#### Terminal 3 - Frontend
```bash
cd apps/frontend
npm install
npm run dev
```

#### Terminal 4 - Scraper (opcional)
```bash
cd apps/scraper
npm install
npm run scrape
```

## Primeiros Passos

1. Acesse http://localhost:3000 para ver o frontend
2. API disponível em http://localhost:3001
3. Health check: http://localhost:3001/health

## Rotas da API

- `GET /health` - Health check
- `GET /api/products` - Listar todos os produtos
- `GET /api/products/search?q=termo` - Buscar produtos

## Modelo de Dados

### Stores
```
- id (CUID)
- name (String, único)
- url (String)
- createdAt, updatedAt
```

### Products
```
- id (CUID)
- name (String)
- description (String, opcional)
- createdAt, updatedAt
```

### Prices
```
- id (CUID)
- productId (FK)
- storeId (FK)
- price (Float)
- url (String)
- createdAt, updatedAt
```

## Próximos Passos

- [ ] Implementar autenticação
- [ ] Adicionar mais scrapers de lojas
- [ ] Criar sistema de notificações
- [ ] Implementar filtros avançados
- [ ] Dashboard de comparação de preços
- [ ] Sistema de favoritos
- [ ] Histórico de preços

## Contributing

Contribuições são bem-vindas! 

## License

MIT
