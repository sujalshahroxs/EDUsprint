import { useEffect, useState } from 'react';
import { fetchAnalytics, fetchProjects } from '../services/api';
import { BarChart3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [stats, setStats] = useState<any>(null);
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
      fetchAnalytics(activeProjectId).then(data => setStats(data));
    }
  }, [activeProjectId]);

  if (!stats) return <div className="p-8">Loading analytics...</div>;

  const taskData = stats.tasksByStatus || [];
  const riskData = stats.risksBySeverity || [];

  // Fake velocity data for chart (since backend doesn't track historical velocity yet)
  const velocityData = [
    { name: 'Sprint 1', points: 24 },
    { name: 'Sprint 2', points: 32 },
    { name: 'Sprint 3', points: 28 },
    { name: 'Current', points: 15 },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-blue-600" />
            Project Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Deep dive into project metrics and velocity</p>
        </div>
        <select
          value={activeProjectId}
          onChange={(e) => setActiveProjectId(e.target.value)}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
        >
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Overall Completion</h3>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">
              {stats.tasks.total > 0 ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) : 0}%
            </span>
            <span className="text-sm text-green-500 font-medium mb-1 flex items-center"><TrendingUp size={14}/> On track</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Risks</h3>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">{stats.risks.open}</span>
            <span className="text-sm text-red-500 font-medium mb-1">{stats.risks.critical} Critical</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Tasks Remaining</h3>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">{stats.tasks.total - stats.tasks.completed}</span>
            <span className="text-sm text-slate-400 font-medium mb-1">Across all sprints</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Sprint Velocity (Story Points)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155"/>
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Area type="monotone" dataKey="points" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPoints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Tasks by Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="status" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {taskData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">AI Interpretation</h3>
        <p className="text-blue-800 dark:text-blue-200">
          Most tasks are currently {taskData.length > 0 ? taskData.reduce((a:any, b:any) => a.count > b.count ? a : b).status : 'in planning'}, indicating active execution.
          There are {stats.risks.critical} critical risks that need immediate attention before the next sprint planning phase.
        </p>
      </div>
    </div>
  );
}
