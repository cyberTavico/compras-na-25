import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth';
import { priceAlertRoutes } from './routes/price-alerts';
import { notificationRoutes, checkPriceAlerts } from './routes/notifications';

dotenv.config();

const app = Fastify({ logger: true });
const prisma = new PrismaClient();
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register plugins
app.register(cors, {
  origin: true,
});

app.register(jwt, {
  secret: JWT_SECRET,
});

// Declare custom authenticate decorator
declare module 'fastify' {
  interface FastifyRequest {
    user: { id: string; email: string };
  }
}

// Authenticate hook
app.decorate(
  'authenticate',
  async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Não autorizado' });
    }
  }
);

// Health check
app.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
app.register(authRoutes);
app.register(priceAlertRoutes);
app.register(notificationRoutes);

// Get all products
app.get('/api/products', async (request, reply) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        prices: {
          include: {
            store: true,
          },
          orderBy: { price: 'asc' },
        },
      },
      take: 50,
    });
    return products;
  } catch (error) {
    reply.status(500).send({ error: 'Erro ao buscar produtos' });
  }
});

// Search products
app.get<{ Querystring: { q: string } }>('/api/products/search', async (request, reply) => {
  try {
    const { q } = request.query;
    if (!q) {
      return reply.status(400).send({ error: 'Parâmetro "q" é obrigatório' });
    }

    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive',
        },
      },
      include: {
        prices: {
          include: {
            store: true,
          },
          orderBy: { price: 'asc' },
        },
      },
    });
    return products;
  } catch (error) {
    reply.status(500).send({ error: 'Erro ao buscar produtos' });
  }
});

// Get prices by product
app.get<{ Params: { productId: string } }>('/api/products/:productId/prices', async (request, reply) => {
  try {
    const { productId } = request.params;
    const prices = await prisma.price.findMany({
      where: { productId },
      include: { store: true },
      orderBy: { price: 'asc' },
    });
    return prices;
  } catch (error) {
    reply.status(500).send({ error: 'Erro ao buscar preços' });
  }
});

// Get all stores
app.get('/api/stores', async (request, reply) => {
  try {
    const stores = await prisma.store.findMany();
    return stores;
  } catch (error) {
    reply.status(500).send({ error: 'Erro ao buscar lojas' });
  }
});

// Start server
const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);

    // Start price alert checker every hour
    setInterval(checkPriceAlerts, 3600000); // 1 hour
    console.log('⏰ Verificador de alertas de preço iniciado');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
