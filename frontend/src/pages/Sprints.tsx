import { useEffect, useState } from 'react';
import { fetchSprints, createSprint, fetchProjects } from '../services/api';
import { RotateCw, Plus, Search, Calendar, Flag } from 'lucide-react';

export default function Sprints() {
  const [sprints, setSprints] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [newSprint, setNewSprint] = useState({ name: '', goal: '', startDate: '', endDate: '', status: 'Planned' });

  useEffect(() => {
    fetchProjects().then(data => {
      setProjects(data);
      if (data.length > 0) setActiveProjectId(data[0].id.toString());
    });
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      loadSprints();
    }
  }, [activeProjectId]);

  const loadSprints = () => {
    fetchSprints(activeProjectId).then(setSprints);
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    await createSprint({ ...newSprint, projectId: parseInt(activeProjectId) });
    setShowModal(false);
    loadSprints();
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCw className="text-purple-600" />
            Sprints
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage agile sprints and iterations</p>
        </div>
        <div className="flex gap-4">
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus size={18} /> New Sprint
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sprints.map((s) => (
          <div key={s.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition-colors hover:border-purple-300 dark:hover:border-purple-700">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{s.name}</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                  ${s.status === 'Active' ? 'bg-green-100 text-green-700' :
                    s.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}
                `}>{s.status}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4 flex items-start gap-2">
                <Flag size={16} className="text-slate-400 mt-0.5 shrink-0" />
                {s.goal || 'No sprint goal defined.'}
              </p>
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5"><Calendar size={16} /> {s.startDate} to {s.endDate}</div>
              </div>
            </div>
          </div>
        ))}
        {sprints.length === 0 && (
          <div className="p-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500">
            No sprints found for this project.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Create New Sprint</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Sprint Name</label>
                <input required type="text" value={newSprint.name} onChange={e => setNewSprint({...newSprint, name: e.target.value})} placeholder="e.g., Sprint 1" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Sprint Goal</label>
                <textarea rows={2} value={newSprint.goal} onChange={e => setNewSprint({...newSprint, goal: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input required type="date" value={newSprint.startDate} onChange={e => setNewSprint({...newSprint, startDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input required type="date" value={newSprint.endDate} onChange={e => setNewSprint({...newSprint, endDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Create Sprint</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}