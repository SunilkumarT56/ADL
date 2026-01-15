import { Router } from 'express';
import { AuthController } from './auth.controller';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post('/login', controller.login);
  router.post('/register', controller.register);

  return router;
}
