import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function favoriteRoutes(app: FastifyInstance) {
  // Add product to favorites
  app.post<{ Params: { productId: string } }>(
    '/api/favorites/:productId',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { productId } = request.params;

        // Check if product exists
        const product = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          return reply.status(404).send({ error: 'Produto não encontrado' });
        }

        // Add to favorites
        await prisma.user.update({
          where: { id: request.user.id },
          data: {
            favorites: {
              connect: { id: productId },
            },
          },
        });

        return reply.status(201).send({ message: 'Adicionado aos favoritos' });
      } catch (error) {
        return reply.status(500).send({ error: 'Erro ao adicionar favorito' });
      }
    }
  );

  // Get user's favorites
  app.get(
    '/api/favorites',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: request.user.id },
          include: {
            favorites: {
              include: {
                prices: {
                  include: { store: true },
                  orderBy: { price: 'asc' },
                },
              },
            },
          },
        });

        return user?.favorites || [];
      } catch (error) {
        return reply.status(500).send({ error: 'Erro ao buscar favoritos' });
      }
    }
  );

  // Remove from favorites
  app.delete<{ Params: { productId: string } }>(
    '/api/favorites/:productId',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { productId } = request.params;

        await prisma.user.update({
          where: { id: request.user.id },
          data: {
            favorites: {
              disconnect: { id: productId },
            },
          },
        });

        return reply.send({ message: 'Removido dos favoritos' });
      } catch (error) {
        return reply.status(500).send({ error: 'Erro ao remover favorito' });
      }
    }
  );

  // Check if product is favorite
  app.get<{ Params: { productId: string } }>(
    '/api/favorites/:productId/check',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { productId } = request.params;

        const user = await prisma.user.findUnique({
          where: { id: request.user.id },
          include: {
            favorites: {
              where: { id: productId },
            },
          },
        });

        return { isFavorite: (user?.favorites.length || 0) > 0 };
      } catch (error) {
        return reply.status(500).send({ error: 'Erro ao verificar favorito' });
      }
    }
  );
}
