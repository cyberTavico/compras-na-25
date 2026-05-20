import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = Fastify({ logger: true });
const prisma = new PrismaClient();
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '0.0.0.0';

// Register CORS
app.register(cors, {
  origin: true,
});

// Health check
app.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Get all products
app.get('/api/products', async (request, reply) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        prices: {
          include: {
            store: true,
          },
        },
      },
    });
    return products;
  } catch (error) {
    reply.status(500).send({ error: 'Failed to fetch products' });
  }
});

// Search products
app.get<{ Querystring: { q: string } }>('/api/products/search', async (request, reply) => {
  try {
    const { q } = request.query;
    if (!q) {
      return reply.status(400).send({ error: 'Query parameter "q" is required' });
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
        },
      },
    });
    return products;
  } catch (error) {
    reply.status(500).send({ error: 'Failed to search products' });
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
    reply.status(500).send({ error: 'Failed to fetch prices' });
  }
});

// Get all stores
app.get('/api/stores', async (request, reply) => {
  try {
    const stores = await prisma.store.findMany();
    return stores;
  } catch (error) {
    reply.status(500).send({ error: 'Failed to fetch stores' });
  }
});

// Start server
const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
