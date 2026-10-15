import { useEffect, useState, useRef } from 'react';
import { fetchProjects, createProject, deleteProject, updateProject } from '../services/api';
import { FolderKanban, Plus, Search, Calendar, User, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ name: '', description: '', startDate: '', endDate: '', status: 'Planning', manager: 'Sujal Shah' });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadProjects = () => fetchProjects().then(setProjects);

  useEffect(() => { loadProjects(); }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateOrUpdate = async (e: any) => {
    e.preventDefault();
    if (isEditing && editingId) {
      await updateProject(editingId, newProject);
    } else {
      await createProject(newProject);
    }
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setNewProject({ name: '', description: '', startDate: '', endDate: '', status: 'Planning', manager: 'Sujal Shah' });
    loadProjects();
  };

  const openEditModal = (project: any) => {
    setNewProject(project);
    setEditingId(project.id);
    setIsEditing(true);
    setShowModal(true);
    setActiveDropdown(null);
  };

  const openCreateModal = () => {
    setNewProject({ name: '', description: '', startDate: '', endDate: '', status: 'Planning', manager: 'Sujal Shah' });
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    setActiveDropdown(null);
    if (window.confirm(`Are you sure you want to delete project: "${name}"? This action cannot be undone and will delete all associated sprints, tasks, and risks.`)) {
      await deleteProject(id);
      loadProjects();
    }
  };

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="text-blue-600" />
            Projects
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage software development projects</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} /> New Project
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search projects..." className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="overflow-visible">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">Project Name</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Manager</th>
                <th className="px-6 py-4 font-semibold">Timeline</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 relative">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
                    <div className="text-sm text-slate-500 truncate max-w-xs">{p.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                      ${p.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}
                    `}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {p.manager.charAt(0)}
                    </div>
                    {p.manager}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                    <div className="flex items-center gap-1"><Calendar size={14}/> {p.startDate} to {p.endDate}</div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={(e) => toggleDropdown(p.id, e)}
                      className={`p-2 rounded-lg transition-colors ${activeDropdown === p.id ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      <MoreVertical size={18}/>
                    </button>
                    {activeDropdown === p.id && (
                      <div ref={dropdownRef} className="absolute right-6 top-14 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 py-1 overflow-hidden">
                        <button onClick={() => { setActiveDropdown(null); alert('View Details functionality placeholder. (In a real app, this would route to /project/:id)'); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <Eye size={16} /> View Project
                        </button>
                        <button onClick={() => openEditModal(p)} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <Edit size={16} /> Edit Project
                        </button>
                        <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                        <button onClick={() => handleDelete(p.id, p.name)} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium">
                          <Trash2 size={16} /> Delete Project
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No projects found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{isEditing ? 'Edit Project' : 'Create New Project'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                <input required type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea rows={3} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input required type="date" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input required type="date" value={newProject.endDate} onChange={e => setNewProject({...newProject, endDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
                  <option>Planning</option>
                  <option>Active</option>
                  <option>Completed</option>
                  <option>On Hold</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg">{isEditing ? 'Save Changes' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}