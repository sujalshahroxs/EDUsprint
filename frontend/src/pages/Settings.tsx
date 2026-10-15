import { useState } from 'react';
import { resetDemoData } from '../services/api';
import { Settings as SettingsIcon, Database, Moon, Sun, Monitor, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [resetStatus, setResetStatus] = useState('');

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleResetData = async () => {
    if (window.confirm('WARNING: This will delete all current projects, tasks, sprints, and risks, and replace them with fresh demo data. Are you sure?')) {
      try {
        setResetStatus('Resetting data...');
        await resetDemoData();
        setResetStatus('Demo data loaded successfully! Refreshing...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        setResetStatus('Failed to reset data.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="text-slate-500" />
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Application preferences and data management</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <input type="text" readOnly value="Sujal Shah" className="w-full max-w-md px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <input type="text" readOnly value="Project Manager" className="w-full max-w-md px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Appearance</h2>
          </div>
          <div className="p-6">
            <div className="flex gap-4">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex items-center gap-2 px-4 py-3 border rounded-xl font-medium transition-colors ${theme === 'light' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <Sun size={18} /> Light Mode
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center gap-2 px-4 py-3 border rounded-xl font-medium transition-colors ${theme === 'dark' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <Moon size={18} /> Dark Mode
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={`flex items-center gap-2 px-4 py-3 border rounded-xl font-medium transition-colors ${theme === 'system' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <Monitor size={18} /> System
              </button>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Integrations</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Jira Cloud</h3>
                <p className="text-sm text-slate-500 mt-1">Connect your workspace to Jira Cloud for two-way synchronization of tasks and sprints.</p>
              </div>
              <a href="/jira" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Configure Jira
              </a>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
              <Database size={20} /> Data Management
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
              For college demonstration purposes, you can reset the entire database to a realistic populated state. This helps show the platform with full charts and data.
            </p>
            <button
              onClick={handleResetData}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <AlertTriangle size={18} /> Reset Demo Data
            </button>
            {resetStatus && <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mt-2">{resetStatus}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}