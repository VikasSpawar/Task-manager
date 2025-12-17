// backend/src/routes/task.routes.ts
import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticateToken } from '../middlewares/auth.middleware'; // 👈 Import the guard

const router = Router();
const taskController = new TaskController();

// 🔒 Protect these routes!
// Now 'req.user' will exist inside the controller
router.get('/', authenticateToken, taskController.getAll);
router.post('/', authenticateToken, taskController.create);
router.patch('/:id', authenticateToken, taskController.update);
router.delete('/:id', authenticateToken, taskController.delete);

export default router;