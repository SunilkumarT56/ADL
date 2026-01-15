import { hashPassword } from '@/utils/password.util';
import { SUCCESS_CODES } from '@/modules/auth/auth.constants';
import type { PrismaClient } from 'db/client';
import type { RedisClientType } from 'redis';

export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    redis: RedisClientType,
  ) {}
  async login(data: { email: string; password: string }) {
    return {
      message: SUCCESS_CODES.MESSAGE_SENT,
      email: data.email,
    };
  }

  async register(data: { email: string; password: string; name: string }) {
    const hashedPassword = await hashPassword(data.password);
    return {
      message: SUCCESS_CODES.USER_REGISTERED,
      email: data.email,
    };
  }
}
