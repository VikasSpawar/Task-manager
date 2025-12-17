// backend/src/repositories/task.repository.ts
import { PrismaClient, Task, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class TaskRepository {
  
  // Create a new task
  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    return prisma.task.create({
      data,
      include: { assignee: true, creator: true } // Return user details immediately
    });
  }

  // Find all tasks with filters
  async findAll(where?: Prisma.TaskWhereInput): Promise<Task[]> {
    return prisma.task.findMany({
      where,
      include: { assignee: true, creator: true },
      orderBy: { dueDate: 'asc' }
    });
  }

  // Find one by ID
  async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id },
      include: { assignee: true, creator: true }
    });
  }

  // Update task
  async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data,
      include: { assignee: true, creator: true }
    });
  }

  // Delete task
  async delete(id: string): Promise<Task> {
    return prisma.task.delete({
      where: { id }
    });
  }
}