import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const createPriceAlertSchema = z.object({
  productId: z.string(),
  targetPrice: z.number().positive('Preço deve ser maior que 0'),
});

const updatePriceAlertSchema = z.object({
  targetPrice: z.number().positive('Preço deve ser maior que 0'),
  isActive: z.boolean().optional(),
});

type CreatePriceAlertInput = z.infer<typeof createPriceAlertSchema>;
type UpdatePriceAlertInput = z.infer<typeof updatePriceAlertSchema>;

export async function priceAlertRoutes(app: FastifyInstance) {
  // Create price alert
  app.post<{ Body: CreatePriceAlertInput }>(
    '/api/price-alerts',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const validatedData = createPriceAlertSchema.parse(request.body);

        // Check if product exists
        const product = await prisma.product.findUnique({
          where: { id: validatedData.productId },
        });

        if (!product) {
          return reply.status(404).send({ error: 'Produto não encontrado' });
        }

        // Check if alert already exists
        const existingAlert = await prisma.priceAlert.findUnique({
          where: {
            userId_productId: {
              userId: request.user.id,
              productId: validatedData.productId,
            },
          },
        });

        if (existingAlert) {
          return reply.status(400).send({ error: 'Alerta já existe para este produto' });
        }

        const alert = await prisma.priceAlert.create({
          data: {
            userId: request.user.id,
            productId: validatedData.productId,
            targetPrice: validatedData.targetPrice,
          },
          include: { product: true },
        });

        return reply.status(201).send(alert);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ errors: error.errors });
        }
        return reply.status(500).send({ error: 'Erro ao criar alerta de preço' });
      }
    }
  );

  // Get user's price alerts
  app.get(
    '/api/price-alerts',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const alerts = await prisma.priceAlert.findMany({
          where: { userId: request.user.id },
          include: {
            product: {
              include: {
                prices: {
                  include: { store: true },
                  orderBy: { price: 'asc' },
                },
              },
            },
          },
        });

        return alerts;
      } catch (error) {
        return reply.status(500).send({ error: 'Erro ao buscar alertas' });
      }
    }
  );

  // Get single price alert
  app.get<{ Params: { alertId: string } }>(
    '/api/price-alerts/:alertId',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { alertId } = request.params;

        const alert = await prisma.priceAlert.findUnique({
          where: { id: alertId },
          include: {
            product: {
              include: {
                prices: {
                  include: { store: true },
                  orderBy: { price: 'asc' },
                },
              },
            },
          },
        });

        if (!alert) {
          return reply.status(404).send({ error: 'Alerta não encontrado' });
        }

        if (alert.userId !== request.user.id) {
          return reply.status(403).send({ error: 'Acesso negado' });
        }

        return alert;
      } catch (error) {
        return reply.status(500).send({ error: 'Erro ao buscar alerta' });
      }
    }
  );

  // Update price alert
  app.patch<{ Params: { alertId: string }; Body: UpdatePriceAlertInput }>(
    '/api/price-alerts/:alertId',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { alertId } = request.params;
        const validatedData = updatePriceAlertSchema.parse(request.body);

        const alert = await prisma.priceAlert.findUnique({
          where: { id: alertId },
        });

        if (!alert) {
          return reply.status(404).send({ error: 'Alerta não encontrado' });
        }

        if (alert.userId !== request.user.id) {
          return reply.status(403).send({ error: 'Acesso negado' });
        }

        const updated = await prisma.priceAlert.update({
          where: { id: alertId },
          data: validatedData,
          include: { product: true },
        });

        return updated;
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ errors: error.errors });
        }
        return reply.status(500).send({ error: 'Erro ao atualizar alerta' });
      }
    }
  );

  // Delete price alert
  app.delete<{ Params: { alertId: string } }>(
    '/api/price-alerts/:alertId',
    { onRequest: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { alertId } = request.params;

        const alert = await prisma.priceAlert.findUnique({
          where: { id: alertId },
        });

        if (!alert) {
          return reply.status(404).send({ error: 'Alerta não encontrado' });
        }

        if (alert.userId !== request.user.id) {
          return reply.status(403).send({ error: 'Acesso negado' });
        }

        await prisma.priceAlert.delete({
          where: { id: alertId },
        });

        return reply.send({ message: 'Alerta removido com sucesso' });
      } catch (error) {
        return reply.status(500).send({ error: 'Erro ao remover alerta' });
      }
    }
  );
}
