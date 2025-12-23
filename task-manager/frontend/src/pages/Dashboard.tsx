
import { format, isToday, isTomorrow } from 'date-fns';
import {
    AlertCircle,
    ArrowUpDown,
    Calendar,
    Clock,
    GripVertical,
    Layers,
    LayoutGrid,
    List as ListIcon,
    LogOut,
    Moon,
    Plus,
    Search,
    Sun,
    Zap
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';

import { CreateTaskModal } from '../components/CreateTaskModal';
import api from '../lib/axios';
import { socket } from '../lib/socket';
import { Priority, Status, Task } from '../types';

// --- Types & Utilities ---
const fetcher = (url: string) => api.get(url).then(res => res.data);

const PriorityDot = ({ priority }: { priority: Priority }) => {
  const colors = {
    [Priority.URGENT]: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
    [Priority.HIGH]: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]",
    [Priority.MEDIUM]: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
    [Priority.LOW]: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
  };
  return <div className={`w-2 h-2 rounded-full ${colors[priority]}`} />;
};

// Helper for nice date displays
const DateBadge = ({ date }: { date: string }) => {
  const d = new Date(date);
  const isExpired = d < new Date();
  let text = format(d, 'MMM d');
  let colorClass = "text-gray-500 dark:text-gray-400";
  let Icon = Calendar;

  if (isExpired) {
    text = "Overdue";
    colorClass = "text-rose-500 font-bold";
    Icon = AlertCircle;
  } else if (isToday(d)) {
    text = "Today";
    colorClass = "text-indigo-500 font-bold";
    Icon = Clock;
  } else if (isTomorrow(d)) {
    text = "Tomorrow";
    colorClass = "text-blue-500";
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs ${colorClass}`}>
      <Icon size={14} />
      <span>{text}</span>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  // 1. Data & State
  const { data: tasks, error, isLoading } = useSWR<Task[]>('/tasks', fetcher);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters & View State
  const [filter, setFilter] = useState<'ALL' | 'MINE' | 'OVERDUE'>('ALL');
  const [sortBy, setSortBy] = useState<'DATE' | 'PRIORITY' | 'ALPHA'>('DATE');
  const [viewMode, setViewMode] = useState<'BOARD' | 'LIST'>('BOARD');
  const [search, setSearch] = useState('');
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  // 2. Effects
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    socket.on('task-updated', () => mutate('/tasks'));
    return () => { socket.off('task-updated'); };
  }, []);

  // 3. Logic: Filtering & Sorting
  const processedTasks = useMemo(() => {
    if (!tasks) return [];
    let result = [...tasks];

    // Filter
    if (search) result = result.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'MINE') result = result.filter(t => t.assignedToId === currentUser.id);
    else if (filter === 'OVERDUE') result = result.filter(t => new Date(t.dueDate) < new Date() && t.status !== Status.COMPLETED);

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'DATE') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (sortBy === 'ALPHA') return a.title.localeCompare(b.title);
      if (sortBy === 'PRIORITY') {
        const pMap = { [Priority.URGENT]: 3, [Priority.HIGH]: 2, [Priority.MEDIUM]: 1, [Priority.LOW]: 0 };
        return pMap[b.priority] - pMap[a.priority];
      }
      return 0;
    });

    return result;
  }, [tasks, filter, search, sortBy, currentUser.id]);

  // Grouping for Board View
  const tasksByStatus = {
    [Status.TODO]: processedTasks.filter(t => t.status === Status.TODO),
    [Status.IN_PROGRESS]: processedTasks.filter(t => t.status === Status.IN_PROGRESS),
    [Status.REVIEW]: processedTasks.filter(t => t.status === Status.REVIEW),
    [Status.COMPLETED]: processedTasks.filter(t => t.status === Status.COMPLETED),
  };

  // Stats Logic
  const completionRate = useMemo(() => {
    if (!processedTasks.length) return 0;
    const completed = processedTasks.filter(t => t.status === Status.COMPLETED).length;
    return Math.round((completed / processedTasks.length) * 100);
  }, [processedTasks]);

  // 4. Handlers
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      mutate('/tasks'); 
    } catch (err) { console.error("Failed to move task"); }
  };

  const handleDelete = async (taskId: string) => {
    if (confirm("Delete this task?")) {
      await api.delete(`/tasks/${taskId}`);
      mutate('/tasks');
    }
  };

  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks?.find(t => t.id === taskId);
    if (task && task.status !== newStatus) handleStatusChange(taskId, newStatus);
  };

  // --- Render Helpers ---

  if (error) return <div className="h-screen flex items-center justify-center text-rose-500">API Error</div>;

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0B0F19] transition-colors duration-500 font-sans selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] opacity-50 dark:opacity-20 mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] opacity-50 dark:opacity-20 mix-blend-multiply dark:mix-blend-lighten" />
      </div>

      {/* Navbar */}
      <div className="sticky top-6 z-40 px-4 md:px-8 max-w-[1600px] mx-auto mb-8">
        <nav className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-sm dark:shadow-black/20 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight leading-none">TeamTask</h1>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">Project Board</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative hidden md:block group">
              <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100/50 dark:bg-gray-800/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-gray-800 transition-all w-64 text-gray-700 dark:text-gray-200"
              />
            </div>
            <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2 hidden md:block" />
            
            {/* User Profile */}
            <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                {currentUser?.name?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  {currentUser?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentUser?.email}
                </p>
              </div>
            </div>
            
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => { localStorage.clear(); window.location.href='/'; }} className="p-2.5 rounded-xl text-gray-500 hover:bg-rose-50 hover:text-rose-600 dark:text-gray-400 dark:hover:bg-rose-900/20 transition-all">
              <LogOut size={20} />
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-semibold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-900/10 flex items-center gap-2">
              <Plus size={18} strokeWidth={3} />
              <span>Create</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="px-4 md:px-8 max-w-[1600px] mx-auto pb-12 relative z-10">
        
        {/* Toolbar (Filters + Sort + View) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          
          {/* Left: Tabs */}
          <div className="flex gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            {[
              { id: 'ALL', label: 'All', icon: Layers },
              { id: 'MINE', label: 'Mine', icon: Zap },
              { id: 'OVERDUE', label: 'Overdue', icon: AlertCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                  filter === tab.id 
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Center: Progress (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-3 bg-white/30 dark:bg-gray-800/30 px-4 py-2 rounded-full border border-gray-200/50 dark:border-gray-700/50">
             <span className="text-xs font-semibold text-gray-500">Progress</span>
             <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${completionRate}%` }} />
             </div>
             <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{completionRate}%</span>
          </div>

          {/* Right: Sort & View Toggle */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <ArrowUpDown size={14} className="text-gray-400" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
              >
                <option value="DATE">Sort by Date</option>
                <option value="PRIORITY">Sort by Priority</option>
                <option value="ALPHA">Sort A-Z</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <button 
                onClick={() => setViewMode('BOARD')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'BOARD' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-400'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('LIST')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm' : 'text-gray-400'}`}
              >
                <ListIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* --- VIEW: BOARD --- */}
        {viewMode === 'BOARD' && (
          isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-pulse">
               {[1,2,3,4].map(i => <div key={i} className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 overflow-x-auto pb-4">
              {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                <div 
                  key={status} 
                  className={`flex flex-col min-w-[280px] transition-colors duration-300 rounded-3xl p-2 ${dragOverColumn === status ? 'bg-indigo-50/50 dark:bg-indigo-900/20 ring-2 ring-indigo-200 dark:ring-indigo-800' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverColumn(status); }}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={(e) => onDrop(e, status)}
                >
                  <div className="flex items-center justify-between mb-4 px-3">
                    <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${status === Status.TODO ? 'bg-slate-400' : status === Status.IN_PROGRESS ? 'bg-blue-500' : status === Status.REVIEW ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                      {status.replace('_', ' ')}
                    </h2>
                    <span className="bg-gray-200/50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-0.5 rounded-md text-xs font-bold">{statusTasks.length}</span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {statusTasks.map(task => (
                      <div 
                        key={task.id} draggable onDragStart={(e) => onDragStart(e, task.id)}
                        className="group relative bg-white dark:bg-gray-800/90 backdrop-blur-sm p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200 cursor-grab active:cursor-grabbing hover:-translate-y-1"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                             <div className="text-gray-300 dark:text-gray-600 cursor-grab"><GripVertical size={14} /></div>
                             <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-600">
                               <PriorityDot priority={task.priority} />
                               <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase">{task.priority}</span>
                             </div>
                          </div>
                          <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-rose-500 transition-all"><LogOut size={14} className="rotate-180" /></button>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-white leading-snug mb-2">{task.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{task.description || "No details."}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700/50">
                           <DateBadge date={task.dueDate} />
                           {/* Status Select */}
                           <div className="relative group/select">
                             <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="appearance-none bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800/50 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors pr-6 focus:outline-none">
                               <option value={Status.TODO}>Todo</option>
                               <option value={Status.IN_PROGRESS}>In Prog</option>
                               <option value={Status.REVIEW}>Review</option>
                               <option value={Status.COMPLETED}>Done</option>
                             </select>
                           </div>
                        </div>
                      </div>
                    ))}
                    {/* Drop Target */}
                    <div className={`h-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center transition-all ${statusTasks.length === 0 ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`} onClick={() => setIsModalOpen(true)}>
                      <span className="text-xs font-medium text-gray-400">Drop here or + Create</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* --- VIEW: LIST --- */}
        {viewMode === 'LIST' && (
           <div className="bg-white dark:bg-gray-800/50 rounded-3xl border border-gray-200 dark:border-gray-700/50 overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                 <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                   <tr>
                     <th className="px-6 py-4">Task</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Priority</th>
                     <th className="px-6 py-4">Due Date</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                   {processedTasks.map(task => (
                     <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                       <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                         {task.title}
                         {task.description && <p className="text-xs text-gray-400 font-normal truncate max-w-[200px]">{task.description}</p>}
                       </td>
                       <td className="px-6 py-4">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            task.status === Status.COMPLETED ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900' :
                            task.status === Status.IN_PROGRESS ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900' :
                            'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                         }`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${task.status === Status.COMPLETED ? 'bg-green-500' : 'bg-gray-400'}`} />
                           {task.status.replace('_', ' ')}
                         </span>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           <PriorityDot priority={task.priority} />
                           <span className="text-xs font-semibold uppercase">{task.priority}</span>
                         </div>
                       </td>
                       <td className="px-6 py-4"><DateBadge date={task.dueDate} /></td>
                       <td className="px-6 py-4 text-right">
                         <button onClick={() => handleDelete(task.id)} className="text-gray-400 hover:text-rose-500 transition-colors">
                            <LogOut size={16} className="rotate-180" />
                         </button>
                       </td>
                     </tr>
                   ))}
                   {processedTasks.length === 0 && (
                     <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No tasks found matching current filters.</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {isModalOpen && <CreateTaskModal onClose={() => setIsModalOpen(false)} />}
      </main>
    </div>
  );
};