// backend/src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// POST http://localhost:4000/auth/register
router.post('/register', authController.register);

// POST http://localhost:4000/auth/login
router.post('/login', authController.login);

export default router;