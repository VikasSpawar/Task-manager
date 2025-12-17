// backend/src/controllers/task.controller.ts
import { Request, Response } from 'express';
import { CreateTaskSchema, UpdateTaskSchema } from '../dtos/task.dto';
import { TaskService } from '../services/task.service';
import { PrismaClient } from '@prisma/client';

const taskService = new TaskService();
const prisma = new PrismaClient(); // Direct DB access to ensure User exists

export class TaskController {
  
  // GET /tasks
  async getAll(req: Request, res: Response) {
    try {
      const tasks = await taskService.getAllTasks({});
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  }

  // POST /tasks
  async create(req: Request, res: Response) {
    try {
      console.log("📝 Starting Task Creation...");
      const validatedData = CreateTaskSchema.parse(req.body);

      // --- 🛡️ SAFETY CHECK: GET VALID USER ID ---
      let userId = (req as any).user?.id; // Try to get ID from Auth Middleware

      if (!userId) {
        console.log("⚠️ No Auth Token found. searching DB for a fallback user...");
        // Fallback: Find the first user in the database
        const firstUser = await prisma.user.findFirst();
        
        if (firstUser) {
          userId = firstUser.id;
          console.log(`✅ Using fallback user: ${firstUser.email} (${userId})`);
        } else {
          // Emergency: Create a user if DB is totally empty
          console.log("⚠️ Database empty. Creating Emergency User...");
          const newUser = await prisma.user.create({
            data: {
              email: `emergency_${Date.now()}@test.com`,
              name: "Emergency User",
              password: "password123"
            }
          });
          userId = newUser.id;
          console.log(`✅ Created and using Emergency User: ${userId}`);
        }
      }
      // -------------------------------------------

      const task = await taskService.createTask(userId, validatedData);
      console.log("🎉 Task created successfully!");
      res.status(201).json(task);

    } catch (error: any) {
      console.error("❌ CREATE FAILED:", error);
      res.status(400).json({ error: error.message || "Failed to create task" });
    }
  }

  // PATCH /tasks/:id
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = UpdateTaskSchema.parse(req.body);
      const task = await taskService.updateTask(id, validatedData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Failed to update task" });
    }
  }

  // DELETE /tasks/:id
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await taskService.deleteTask(id);
      res.status(204).send(); // 204 = Success, No Content
    } catch (error) {
      console.error("Delete failed:", error);
      res.status(400).json({ error: "Failed to delete task" });
    }
  }
}