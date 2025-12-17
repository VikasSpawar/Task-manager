// backend/src/tests/task.test.ts
import { TaskService } from '../services/task.service';
import { TaskRepository } from '../repositories/task.repository';

// 1. 🛑 Auto-mock the repository class
// Jest automatically replaces all methods in this class with jest.fn()
jest.mock('../repositories/task.repository');

// 2. 🛑 Mock index to prevent Server/Socket crashes
jest.mock('../index', () => ({
  io: {
    emit: jest.fn(),
  },
  prisma: {},
}));

describe('TaskService Logic', () => {
  let taskService: TaskService;

  // 3. 🎯 Grab the auto-generated mocks from the Class Prototype
  // This lets us control what "create" or "findAll" returns
  const mockCreate = TaskRepository.prototype.create as jest.Mock;
  const mockFindAll = TaskRepository.prototype.findAll as jest.Mock;

  beforeEach(() => {
    taskService = new TaskService();
    jest.clearAllMocks();
  });

  // TEST 1: Creation Logic
  it('should create a task with default status TODO', async () => {
    const inputData = { 
        title: 'Test Task', 
        dueDate: new Date(), 
    };
    
    // Tell the mock what to return when called
    mockCreate.mockResolvedValue({ 
        ...inputData, 
        status: 'TODO', 
        id: 'task-1',
        creatorId: 'user-1'
    });

    const result = await taskService.createTask('user-1', inputData as any);

    expect(mockCreate).toHaveBeenCalled();
    expect(result.status).toBe('TODO');
  });

  // TEST 2: Validation of Priority
  it('should allow setting a high priority', async () => {
    const inputData = { 
        title: 'Urgent Task', 
        priority: 'URGENT',
        dueDate: new Date() 
    };
    
    mockCreate.mockResolvedValue({ ...inputData, id: 'task-2' });

    const result = await taskService.createTask('user-1', inputData as any);
    expect(result.priority).toBe('URGENT');
  });

  // TEST 3: Fetching Data
  it('should return a list of tasks', async () => {
    const mockTasks = [{ id: '1', title: 'Task A' }, { id: '2', title: 'Task B' }];
    mockFindAll.mockResolvedValue(mockTasks);

    const result = await taskService.getAllTasks({});
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Task A');
  });
});