import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const host = process.env.DB_HOST;
const port = Number(process.env.DB_PORT ?? 3306);
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD ?? '';
const database = process.env.DB_NAME;

if (!host) {
  throw new Error('DB_HOST belum diatur di file .env');
}

if (!user) {
  throw new Error('DB_USER belum diatur di file .env');
}

if (!database) {
  throw new Error('DB_NAME belum diatur di file .env');
}

const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
