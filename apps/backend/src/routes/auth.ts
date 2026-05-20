import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/password';
import { signupSchema, loginSchema, SignupInput, LoginInput } from '../utils/validation';
import { z } from 'zod';

const prisma = new PrismaClient();

export async function authRoutes(app: FastifyInstance) {
  // Sign Up
  app.post<{ Body: SignupInput }>(
    '/auth/signup',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const validatedData = signupSchema.parse(request.body);

        const existingUser = await prisma.user.findUnique({
          where: { email: validatedData.email },
        });

        if (existingUser) {
          return reply.status(400).send({ error: 'Email já cadastrado' });
        }

        const hashedPassword = await hashPassword(validatedData.password);

        const user = await prisma.user.create({
          data: {
            email: validatedData.email,
            name: validatedData.name,
            password: hashedPassword,
          },
        });

        const token = app.jwt.sign({ id: user.id, email: user.email });

        return reply.status(201).send({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ errors: error.errors });
        }
        return reply.status(500).send({ error: 'Erro ao criar usuário' });
      }
    }
  );

  // Login
  app.post<{ Body: LoginInput }>(
    '/auth/login',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const validatedData = loginSchema.parse(request.body);

        const user = await prisma.user.findUnique({
          where: { email: validatedData.email },
        });

        if (!user) {
          return reply.status(401).send({ error: 'Email ou senha inválidos' });
        }

        const passwordValid = await verifyPassword(
          validatedData.password,
          user.password
        );

        if (!passwordValid) {
          return reply.status(401).send({ error: 'Email ou senha inválidos' });
        }

        const token = app.jwt.sign({ id: user.id, email: user.email });

        return reply.send({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ errors: error.errors });
        }
        return reply.status(500).send({ error: 'Erro ao fazer login' });
      }
    }
  );

  // Get Current User
  app.get('/auth/me', { onRequest: [app.authenticate] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'Usuário não encontrado' });
    }

    return user;
  });

  // Logout (client-side)
  app.post('/auth/logout', { onRequest: [app.authenticate] }, (request, reply) => {
    return reply.send({ message: 'Logout realizado com sucesso' });
  });
}
