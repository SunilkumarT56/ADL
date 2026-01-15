import { hashPassword } from '@/utils/password.util';

export class AuthService {
  async login(data: { email: string; password: string }) {
    
    return {
      message: 'login success',
      email: data.email,
    };
  }

  async register(data: { email: string; password: string }) {
    const hashedPassword = await hashPassword(data.password);

    // later: save user
    return {
      message: 'user registered',
      email: data.email,
    };
  }
}
