import { createClient} from 'redis';
import type { RedisClientType } from 'redis';

export class RedisClient {
  private client: RedisClientType;

  constructor(redisUrl: string) {
    this.client = createClient({
      url: redisUrl,
    });

    this.registerEvents();
  }

  private registerEvents() {
    this.client.on('connect', () => {
      console.log('🟢 Redis connecting...');
    });

    this.client.on('ready', () => {
      console.log('✅ Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error', err);
    });

    this.client.on('end', () => {
      console.log('🔴 Redis connection closed');
    });
  }

  public async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }

  public async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }
}
