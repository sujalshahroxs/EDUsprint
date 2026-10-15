import { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, RotateCw, CheckSquare, ShieldAlert, CalendarClock, BarChart3, FileText, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

const Sidebar = () => {
  const navigate = useNavigate();
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Projects', icon: <FolderKanban size={20} />, path: '/projects' },
    { name: 'Sprints', icon: <RotateCw size={20} />, path: '/sprints' },
    { name: 'Tasks', icon: <CheckSquare size={20} />, path: '/tasks' },
    { name: 'Risks', icon: <ShieldAlert size={20} />, path: '/risks' },
    { name: 'Timeline', icon: <CalendarClock size={20} />, path: '/timeline' },
    { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
    { name: 'Reports', icon: <FileText size={20} />, path: '/reports' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="w-64 h-screen bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 flex flex-col transition-colors duration-200 sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-500 flex items-center gap-2">
          <FolderKanban className="text-primary-600 dark:text-primary-500" />
          EduSprint
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Agile Project Planning</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-dark-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md mb-2 bg-gray-50 dark:bg-dark-700">
          <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm">
            SS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Sujal Shah</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Project Manager</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </div>
  );
};

export const Layout = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial state from the script injected in index.html
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Setup an observer to watch for class changes on html (in case Settings page changes it)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between px-8 shrink-0 transition-colors duration-200">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Workspace</h2>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
