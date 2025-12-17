// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService, LoginSchema, RegisterSchema } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  
  async register(req: Request, res: Response) {
    try {
      const data = RegisterSchema.parse(req.body);
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    
    try {
      const data = LoginSchema.parse(req.body);
      const result = await authService.login(data);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}