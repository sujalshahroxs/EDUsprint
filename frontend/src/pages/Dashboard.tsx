import { useEffect, useState } from 'react';
import { fetchAnalytics, fetchProjects } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Briefcase, RotateCw, CheckSquare, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'];
const RISK_COLORS = { 'LOW': '#22c55e', 'MEDIUM': '#f59e0b', 'HIGH': '#f97316', 'CRITICAL': '#ef4444' };

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [projectAnalytics, setProjectAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics().then(data => setStats(data));
    fetchProjects().then(data => {
      if (data && data.length > 0) {
        setProject(data[0]);
        fetchAnalytics(data[0].id).then(aData => setProjectAnalytics(aData));
      }
    });
  }, []);

  if (!stats) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  const taskData = projectAnalytics?.tasksByStatus.map((t: any) => ({
    name: t.status,
    value: t.count
  })) || [];

  const riskData = projectAnalytics?.risksBySeverity.map((r: any) => ({
    name: r.severity,
    value: r.count
  })) || [];

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Good morning, Sujal 👋</h1>
        {project && <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">{project.name} - {project.status}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <StatCard title="Total Projects" value={stats.totalProjects} icon={<Briefcase />} color="bg-blue-100 text-blue-600" />
        <StatCard title="Active Sprints" value={stats.activeSprints} icon={<RotateCw />} color="bg-indigo-100 text-indigo-600" />
        <StatCard title="Total Tasks" value={stats.totalTasks} icon={<CheckSquare />} color="bg-gray-100 text-gray-600" />
        <StatCard title="Completed Tasks" value={stats.completedTasks} icon={<CheckCircle />} color="bg-green-100 text-green-600" />
        <StatCard title="Open Risks" value={stats.openRisks} icon={<AlertTriangle />} color="bg-yellow-100 text-yellow-600" />
        <StatCard title="Critical Risks" value={stats.criticalRisks} icon={<AlertTriangle />} color="bg-red-100 text-red-600" />
      </div>

      {projectAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-200 dark:border-dark-700 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Task Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {taskData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-200 dark:border-dark-700 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Risk Severity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                  <XAxis dataKey="name" tick={{fill: '#6b7280'}} />
                  <YAxis tick={{fill: '#6b7280'}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {riskData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={(RISK_COLORS as any)[entry.name] || '#9ca3af'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-200 dark:border-dark-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          <ActivityItem title="Sprint 2 started" time="2 days ago" type="sprint" />
          <ActivityItem title="Risk 'Unclear API Spec' marked as CRITICAL" time="3 days ago" type="risk" />
          <ActivityItem title="Task 'Design Dashboard' completed" time="5 days ago" type="task" />
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: any, color: string }) => (
  <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-200 dark:border-dark-700 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
        {icon}
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const ActivityItem = ({ title, time, type }: { title: string, time: string, type: 'task' | 'sprint' | 'risk' }) => {
  const icons = {
    task: <CheckSquare size={16} className="text-blue-500" />,
    sprint: <RotateCw size={16} className="text-purple-500" />,
    risk: <AlertTriangle size={16} className="text-red-500" />
  };
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 p-2 bg-gray-50 dark:bg-dark-700 rounded-full">
        {icons[type]}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
          <Clock size={12} /> {time}
        </p>
      </div>
    </div>
  );
};
