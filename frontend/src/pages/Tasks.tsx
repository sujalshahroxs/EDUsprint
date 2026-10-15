import { useState, useEffect } from 'react';
import { fetchTasks, fetchProjects, createTask, updateTask } from '../services/api';
import { CheckSquare, Plus, Clock, User, AlertCircle, GripVertical } from 'lucide-react';

const COLUMNS = ['TO DO', 'IN PROGRESS', 'TESTING', 'DONE'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'TO DO', priority: 'Medium', assignee: '', sprintId: '', deadline: '' });
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects().then(data => {
      setProjects(data);
      if (data.length > 0) setActiveProjectId(data[0].id.toString());
    });
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      loadTasks();
    }
  }, [activeProjectId]);

  const loadTasks = () => {
    fetchTasks(activeProjectId).then(setTasks);
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    await createTask({ ...newTask, projectId: parseInt(activeProjectId) });
    setShowModal(false);
    loadTasks();
    setNewTask({ title: '', description: '', status: 'TO DO', priority: 'Medium', assignee: '', sprintId: '', deadline: '' });
  };

  const handleDragStart = (e: any, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const handleDrop = async (e: any, targetStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Optimistic UI update
    setTasks(tasks.map(t => t.id.toString() === taskId ? { ...t, status: targetStatus } : t));

    // Backend update
    await updateTask(taskId, { status: targetStatus });
    setDraggedTaskId(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col pb-4">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="text-pink-600" />
            Task Board
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage tasks and sprint progress</p>
        </div>
        <div className="flex gap-4">
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col}
            className="flex-1 min-w-[300px] flex flex-col bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col)}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 rounded-t-xl">
              <h3 className="font-bold text-slate-700 dark:text-slate-300">{col}</h3>
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold">
                {tasks.filter(t => t.status === col).length}
              </span>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {tasks.filter(t => t.status === col).map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id.toString())}
                  className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 cursor-grab active:cursor-grabbing hover:border-pink-300 dark:hover:border-pink-700 transition-colors ${draggedTaskId === task.id.toString() ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 items-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.jiraIssueKey && (
                        <a href={task.jiraUrl} target="_blank" rel="noopener noreferrer" className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 flex items-center gap-1" title="Open in Jira">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                          {task.jiraIssueKey}
                        </a>
                      )}
                    </div>
                    <button className="text-slate-400 hover:text-slate-600"><GripVertical size={14}/></button>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 leading-tight">{task.title}</h4>

                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mt-4">
                    <div className="flex items-center gap-1.5" title="Assignee">
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-[9px]">
                        {task.assignee ? task.assignee.charAt(0) : '?'}
                      </div>
                      {task.assignee}
                    </div>
                    {task.deadline && (
                      <div className={`flex items-center gap-1 ${(new Date(task.deadline) < new Date() && col !== 'DONE') ? 'text-red-500' : ''}`}>
                        <Clock size={12} />
                        {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Create New Task</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <div className="overflow-y-auto p-6">
              <form id="taskForm" onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
                  <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea rows={3} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
                      {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                    <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
                      {PRIORITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Assignee</label>
                    <input type="text" placeholder="e.g., Sujal Shah" value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
                    <input type="date" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                  </div>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 shrink-0 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/80">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button type="submit" form="taskForm" className="px-4 py-2 font-medium bg-pink-600 hover:bg-pink-700 text-white rounded-lg">Create Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
