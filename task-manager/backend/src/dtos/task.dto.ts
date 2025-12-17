// backend/src/dtos/task.dto.ts
import { z } from 'zod';

// Zod Schema for Creating a Task
export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().optional(),
  // dueDate: z.string().transform((str) => new Date(str)), // Convert string to Date
  // It must allow a string input, which it then transforms
dueDate: z.string().or(z.date()).transform((val) => new Date(val)),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]).optional(),
  assignedToId: z.string().uuid().optional(),
});

// Zod Schema for Updating a Task
export const UpdateTaskSchema = CreateTaskSchema.partial(); // All fields become optional

// Type inference
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;