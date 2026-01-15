import 'dotenv/config';
import { App } from './app';
import { RedisClient } from './config/redis';
import { PrismaService } from 'db/client';

async function bootstrap() {
  try {
    const redis = new RedisClient(process.env.REDIS_URL as string);
    await redis.connect();
    const prisma = new PrismaService();
    await prisma.connect();

    const app = new App(redis, prisma);
    app.start();

    process.on('SIGINT', async () => {
      await redis.disconnect();
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Failed to start application', err);
    process.exit(1);
  }
}

bootstrap();
