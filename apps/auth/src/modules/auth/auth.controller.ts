import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public login = async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);
    res.status(200).json(result);
  };

  public register = async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);
    res.status(201).json(result);
  };
}
