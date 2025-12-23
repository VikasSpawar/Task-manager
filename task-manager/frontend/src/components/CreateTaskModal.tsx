// frontend/src/components/CreateTaskModal.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { mutate } from 'swr';
import { 
  X, 
  Calendar, 
  AlignLeft, 
  Type, 
  Flag,
  Loader2,
  Check
} from 'lucide-react';
import api from '../lib/axios';
import { Priority } from '../types';

interface CreateTaskModalProps {
  onClose: () => void;
}

interface FormData {
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
}

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: 'bg-emerald-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-500' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-500' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-rose-500' },
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { priority: Priority.MEDIUM }
  });
  
  const currentPriority = watch('priority');

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/tasks', {
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate).toISOString(),
        priority: data.priority,
        status: 'TODO'
      });
      
      mutate('/tasks'); // Refresh data
      onClose();
    } catch (error: any) {
      console.error("Backend Error:", error);
      alert("Failed to create task. Check console.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 top-6 w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">New Task</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Add a new item to your board</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
              <Type size={14} /> Title
            </label>
            <input 
              {...register('title', { required: "Title is required", maxLength: 100 })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-gray-800 dark:text-white placeholder:text-gray-400 text-sm font-medium"
              placeholder="e.g. Design System Audit"
              autoFocus
            />
            {errors.title && <span className="text-rose-500 text-xs font-medium ml-1">{errors.title.message}</span>}
          </div>

          {/* Description Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
              <AlignLeft size={14} /> Description
            </label>
            <textarea 
              {...register('description')}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-gray-800 dark:text-white placeholder:text-gray-400 text-sm resize-none"
              placeholder="Add details regarding this task..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <Calendar size={14} /> Due Date
              </label>
              <input 
                type="date"
                {...register('dueDate', { required: true })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-gray-800 dark:text-white text-sm"
              />
            </div>

            {/* Priority Selection (Visual) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <Flag size={14} /> Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('priority', option.value as Priority)}
                    className={`
                      flex flex-col items-center justify-center p-2 rounded-xl border transition-all
                      ${currentPriority === option.value 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 ring-1 ring-indigo-500/30' 
                        : 'bg-white dark:bg-black/20 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                    `}
                    title={option.label}
                  >
                    <div className={`w-3 h-3 rounded-full mb-1 ${option.color}`} />
                    <span className={`text-[10px] font-bold uppercase ${currentPriority === option.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`}>
                      {option.value.slice(0,3)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-gray-900/20 dark:shadow-white/10 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};