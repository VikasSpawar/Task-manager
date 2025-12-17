// frontend/src/components/TaskCard.tsx
import React from 'react';
import { Task, Priority } from '../types';
import clsx from 'clsx'; // Helper for conditional classes

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  [Priority.LOW]: 'bg-blue-100 text-blue-800',
  [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [Priority.HIGH]: 'bg-orange-100 text-orange-800',
  [Priority.URGENT]: 'bg-red-100 text-red-800',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange,onDelete }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <span className={clsx("px-2 py-1 rounded-full text-xs font-bold", priorityColors[task.priority])}>
          {task.priority}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(task.dueDate).toLocaleDateString()}
        </span>
      </div>
      
      <h3 className="font-semibold text-gray-800 mb-1">{task.title}</h3>

   <p className="text-sm text-gray-600 line-clamp-2 mb-4">
        {task.description || "No description"}
      </p>

<button 
  onClick={() => {
    if(confirm('Are you sure?')) onDelete(task.id);
  }}
  className="text-red-500 hover:text-red-700 text-xs ml-auto"
>
  Delete
</button>
   

      {/* Simple Status Dropdown */}
      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
        <div className="text-xs text-gray-500">
           Assigned: {task.assignee?.name || "Unassigned"}
        </div>
        
        <select 
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="text-xs border rounded p-1 bg-gray-50 cursor-pointer"
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="COMPLETED">Done</option>
        </select>
      </div>
    </div>
  );
};






