import { Server } from './server';
import { AuthService } from './modules/auth/auth.service';
import { AuthController } from './modules/auth/auth.controller';
import { createAuthRoutes } from './modules/auth/auth.routes';

export class App {
  private readonly server: Server;

  constructor() {
    const port = Number(process.env.PORT) || 3000;
    this.server = new Server(port);
    const authService = new AuthService();
    const authController = new AuthController(authService);
    const authRoutes = createAuthRoutes(authController);

    this.server.getApp().use('/api/auth', authRoutes);
  }

  public start() {
    this.server.start();
  }
}
