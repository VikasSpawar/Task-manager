// frontend/src/types/index.ts

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum Status {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // Dates often come as strings from JSON
  priority: Priority;
  status: Status;
  creatorId: string;
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
  assignee?: User;
  creator?: User;
}