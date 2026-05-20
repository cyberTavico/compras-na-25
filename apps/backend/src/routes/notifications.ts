import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function notificationRoutes(app: FastifyInstance) {
  // Get user's notifications
  app.get(
    '/api/notifications',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { unreadOnly } = request.query as { unreadOnly?: string };

        const where = {
          userId: request.user.id,
          ...(unreadOnly === 'true' ? { isRead: false } : {}),
        };

        const notifications = await prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 50,
        });

        const unreadCount = await prisma.notification.count({
          where: {
            userId: request.user.id,
            isRead: false,
          },
        });

        return { notifications, unreadCount };
      } catch (error) {
        return reply.status(500).send({ error: 'Erro ao buscar notificações' });
      }
    }
  );

  // Mark notification as read
  app.patch<{ Params: { notificationId: string } }>(
    '/api/notifications/:notificationId/read',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { notificationId } = request.params;

        const notification = await prisma.notification.findUnique({
          where: { id: notificationId },
        });

        if (!notification) {
          return reply.status(404).send({ error: 'Notificação não encontrada' });
        }

        if (notification.userId !== request.user.id) {
          return reply.status(403).send({ error: 'Acesso negado' });
        }

        const updated = await prisma.notification.update({
          where: { id: notificationId },
          data: { isRead: true },
        });

        return updated;
      } catch (error) {
        return reply.status(500).send({ error: 'Erro ao atualizar notificação' });
      }
    }
  );

  // Mark all as read
  app.patch(
    '/api/notifications/mark-all-read',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = await prisma.notification.updateMany({
          where: {
            userId: request.user.id,
            isRead: false,
          },
          data: { isRead: true },
        });

        return { updatedCount: result.count };
      } catch (error) {
        return reply.status(500).send({ error: 'Erro ao atualizar notificações' });
      }
    }
  );

  // Delete notification
  app.delete<{ Params: { notificationId: string } }>(
    '/api/notifications/:notificationId',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { notificationId } = request.params;

        const notification = await prisma.notification.findUnique({
          where: { id: notificationId },
        });

        if (!notification) {
          return reply.status(404).send({ error: 'Notificação não encontrada' });
        }

        if (notification.userId !== request.user.id) {
          return reply.status(403).send({ error: 'Acesso negado' });
        }

        await prisma.notification.delete({
          where: { id: notificationId },
        });

        return reply.send({ message: 'Notificação removida' });
      } catch (error) {
        return reply.status(500).send({ error: 'Erro ao remover notificação' });
      }
    }
  );
}

// Helper function to create notifications
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'PRICE_DROP' | 'PRICE_ALERT' | 'NEW_PRODUCT' | 'FLASH_SALE' | 'GENERIC',
  metadata?: Record<string, any>
) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        metadata: metadata || {},
      },
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
  }
}

// Service to check price alerts and send notifications
export async function checkPriceAlerts() {
  try {
    const alerts = await prisma.priceAlert.findMany({
      where: { isActive: true },
      include: {
        product: {
          include: {
            prices: {
              include: { store: true },
              orderBy: { price: 'asc' },
            },
          },
        },
        user: true,
      },
    });

    for (const alert of alerts) {
      if (alert.product.prices.length === 0) continue;

      const lowestPrice = alert.product.prices[0];

      if (lowestPrice.price <= alert.targetPrice) {
        await createNotification(
          alert.userId,
          `Preço baixou! ${alert.product.name}`,
          `O preço de ${alert.product.name} caiu para R$ ${lowestPrice.price.toFixed(
            2
          )} em ${lowestPrice.store.name}!`,
          'PRICE_DROP',
          {
            productId: alert.product.id,
            storeId: lowestPrice.store.id,
            price: lowestPrice.price,
            productName: alert.product.name,
          }
        );
      }
    }

    console.log('✅ Verificação de alertas de preço completa');
  } catch (error) {
    console.error('Erro ao verificar alertas de preço:', error);
  }
}
