import { useEffect, useState } from 'react';
import { fetchTasks, fetchProjects } from '../services/api';
import { CalendarClock } from 'lucide-react';

export default function Timeline() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');

  useEffect(() => {
    fetchProjects().then(data => {
      setProjects(data);
      if (data.length > 0) setActiveProjectId(data[0].id.toString());
    });
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      fetchTasks(activeProjectId).then(data => {
        // Sort tasks by deadline
        const sorted = data
          .filter((t: any) => t.deadline)
          .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        setTasks(sorted);
      });
    }
  }, [activeProjectId]);

  return (
    <div className="max-w-7xl mx-auto pb-12 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarClock className="text-emerald-600" />
            Project Timeline
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Gantt-style task deadlines and milestones</p>
        </div>
        <select
          value={activeProjectId}
          onChange={(e) => setActiveProjectId(e.target.value)}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
        >
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 p-6 overflow-hidden flex flex-col">
        <div className="mb-6">
          <div className="flex gap-4 items-center text-sm font-medium">
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Completed</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> In Progress</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300"></div> To Do</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Overdue</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto relative">
          <div className="min-w-[800px]">
            {tasks.map((task, index) => {
              const deadlineDate = new Date(task.deadline);
              const isOverdue = deadlineDate < new Date() && task.status !== 'DONE';

              let color = 'bg-slate-300 dark:bg-slate-600';
              if (task.status === 'DONE') color = 'bg-emerald-500';
              else if (task.status === 'IN PROGRESS' || task.status === 'TESTING') color = 'bg-blue-500';
              if (isOverdue) color = 'bg-red-500';

              return (
                <div key={task.id} className="flex items-center mb-4 group">
                  <div className="w-48 shrink-0 text-sm font-medium text-slate-800 dark:text-slate-200 truncate pr-4" title={task.title}>
                    {task.title}
                  </div>
                  <div className="w-32 shrink-0 text-xs font-mono text-slate-500">
                    {deadlineDate.toLocaleDateString()}
                  </div>
                  <div className="flex-1 relative h-8 bg-slate-50 dark:bg-slate-900/50 rounded-md border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                    {/* A fake Gantt bar based on relative position. For a real Gantt, we need start dates on tasks. Using deadline for now. */}
                    <div
                      className={`absolute top-1 bottom-1 left-2 rounded-md transition-all ${color} flex items-center px-2 text-[10px] text-white font-bold whitespace-nowrap overflow-hidden shadow-sm`}
                      style={{ width: `${Math.max(10, Math.min(100, 100 - (index * 2)))}%` }}
                    >
                      {task.status}
                    </div>
                  </div>
                </div>
              );
            })}
            {tasks.length === 0 && (
              <div className="text-center text-slate-500 mt-12">
                No tasks with deadlines found for this project.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}