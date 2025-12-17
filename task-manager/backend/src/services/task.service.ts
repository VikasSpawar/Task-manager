// backend/src/services/task.service.ts
import { TaskRepository } from '../repositories/task.repository';
import { CreateTaskDto, UpdateTaskDto } from '../dtos/task.dto';
import { io } from '../index'; // We will export io from index.ts later


const taskRepo = new TaskRepository();

export class TaskService {
  
// Inside TaskService class...

  async createTask(userId: string, data: CreateTaskDto) {
    const task = await taskRepo.create({
      ...data,
      
      // ✅ FIX: Provide a fallback (Now) if dueDate is somehow undefined
      dueDate: data.dueDate || new Date(),

      creator: { connect: { id: userId } },
      
      // Handle optional assignment safely
      ...(data.assignedToId ? { assignee: { connect: { id: data.assignedToId } } } : {})
    });

    io.emit('task-updated', task); 
    return task;
  }

  async getAllTasks(filters: any) {
    // Logic to build filter object goes here
    return taskRepo.findAll(filters);
  }

  async updateTask(taskId: string, data: UpdateTaskDto) {
    const task = await taskRepo.update(taskId, {
        ...data,
        ...(data.assignedToId ? { assignee: { connect: { id: data.assignedToId } } } : {})
    });
    
    // Real-time: Notify everyone that this task changed
    io.emit('task-updated', task);
    
    return task;
  }

  // Add this inside TaskService class
  async deleteTask(taskId: string) {
    const task = await taskRepo.delete(taskId);
    io.emit('task-updated', task); // Trigger update for everyone
    return task;
  }
}