import { useState, useEffect } from 'react';
import { fetchRisks, fetchProjects } from '../services/api';
import { ShieldAlert, Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function Risks() {
  const [risks, setRisks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [newRisk, setNewRisk] = useState({ title: '', probability: 3, impact: 3, mitigation: '' });
  const [selectedRisk, setSelectedRisk] = useState<any>(null);

  useEffect(() => {
    fetchProjects().then(data => {
      setProjects(data);
      if (data.length > 0) setActiveProjectId(data[0].id.toString());
    });
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      loadRisks();
    }
  }, [activeProjectId]);

  const loadRisks = () => {
    fetchRisks(activeProjectId).then(data => setRisks(data));
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    const score = newRisk.probability * newRisk.impact;
    let severity = 'LOW';
    if (score >= 5) severity = 'MEDIUM';
    if (score >= 10) severity = 'HIGH';
    if (score >= 16) severity = 'CRITICAL';

    await fetch('http://localhost:5001/api/risks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newRisk, projectId: parseInt(activeProjectId), score, severity })
    });
    setShowModal(false);
    loadRisks();
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="text-primary-500" />
            Risk Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Identify, assess, and monitor project risks</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Add New Risk
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search risks..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 focus:outline-none"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Risk Matrix */}
      <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-200 dark:border-dark-700 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Matrix</h3>
          <div className="flex gap-4 text-xs font-medium">
            <span className="flex items-center gap-1 text-green-600"><div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div> 1-4 LOW</span>
            <span className="flex items-center gap-1 text-yellow-600"><div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div> 5-9 MEDIUM</span>
            <span className="flex items-center gap-1 text-orange-600"><div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div> 10-15 HIGH</span>
            <span className="flex items-center gap-1 text-red-600"><div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div> 16-25 CRIT</span>
          </div>
        </div>
        <RiskMatrix risks={risks} onSelectRisk={setSelectedRisk} />
      </div>

      {/* Risk Register Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-dark-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Risk Title</th>
                <th className="px-6 py-4 font-medium">Prob.</th>
                <th className="px-6 py-4 font-medium">Impact</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium">Severity</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-700 text-gray-800 dark:text-gray-200">
              {risks.map((risk) => (
                <tr key={risk.id} onClick={() => setSelectedRisk(risk)} className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-medium">{risk.title}</td>
                  <td className="px-6 py-4">{risk.probability}</td>
                  <td className="px-6 py-4">{risk.impact}</td>
                  <td className="px-6 py-4 font-semibold">{risk.score}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                      ${risk.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                      ${risk.severity === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                      ${risk.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                      ${risk.severity === 'LOW' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                    `}>
                      {risk.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                    <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors"><Edit size={16}/></button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {risks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No risks identified for this project yet.
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
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Log New Risk</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Risk Title</label>
                <input required type="text" value={newRisk.title} onChange={e => setNewRisk({...newRisk, title: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Probability (1-5)</label>
                  <input required type="number" min="1" max="5" value={newRisk.probability} onChange={e => setNewRisk({...newRisk, probability: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Impact (1-5)</label>
                  <input required type="number" min="1" max="5" value={newRisk.impact} onChange={e => setNewRisk({...newRisk, impact: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Mitigation Strategy</label>
                <textarea rows={3} value={newRisk.mitigation} onChange={e => setNewRisk({...newRisk, mitigation: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="How to mitigate this risk..."></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg">Log Risk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedRisk && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white pr-4">{selectedRisk.title}</h3>
                <div className="flex gap-2 items-center mt-2">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold
                        ${selectedRisk.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                        ${selectedRisk.severity === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                        ${selectedRisk.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                        ${selectedRisk.severity === 'LOW' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                      `}>
                        {selectedRisk.severity}
                  </span>
                  {selectedRisk.jiraIssueKey && (
                    <a href={selectedRisk.jiraUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 flex items-center gap-1" title="Open in Jira">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                      {selectedRisk.jiraIssueKey}
                    </a>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedRisk(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-center">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Probability</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{selectedRisk.probability}/5</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-center">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Impact</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{selectedRisk.impact}/5</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-center border-b-2 border-primary-500">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Score</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{selectedRisk.score}</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Mitigation Strategy</h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 p-4 rounded-lg text-sm leading-relaxed border border-blue-100 dark:border-blue-800/30">
                  {selectedRisk.mitigation || 'No mitigation strategy provided.'}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button onClick={() => setSelectedRisk(null)} className="px-4 py-2 font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-lg transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const RiskMatrix = ({ risks, onSelectRisk }: { risks: any[], onSelectRisk: (r: any) => void }) => {
  const matrix = Array(5).fill(0).map(() => Array(5).fill([]));

  risks.forEach(risk => {
    const r = Math.min(Math.max(5 - risk.probability, 0), 4);
    const c = Math.min(Math.max(risk.impact - 1, 0), 4);
    matrix[r][c] = [...(matrix[r][c] || []), risk];
  });

  const getCellColor = (prob: number, imp: number) => {
    const score = prob * imp;
    if (score >= 16) return 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border-red-200 dark:border-red-900/50';
    if (score >= 10) return 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 border-orange-200 dark:border-orange-900/50';
    if (score >= 5) return 'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 border-yellow-200 dark:border-yellow-900/50';
    return 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 border-green-200 dark:border-green-900/50';
  };

  return (
    <div className="flex">
      <div className="flex flex-col justify-center items-center mr-6 w-6 relative">
        <span className="transform -rotate-90 text-sm font-bold text-gray-500 dark:text-gray-400 absolute whitespace-nowrap tracking-wider uppercase">
          Probability (1-5)
        </span>
      </div>
      <div className="flex-1">
        <div className="grid grid-cols-5 gap-2 mb-2">
          {/* Column labels */}
          <div className="col-span-5 grid grid-cols-5 gap-2 mb-1">
             <div className="text-center text-xs font-bold text-slate-400">1</div>
             <div className="text-center text-xs font-bold text-slate-400">2</div>
             <div className="text-center text-xs font-bold text-slate-400">3</div>
             <div className="text-center text-xs font-bold text-slate-400">4</div>
             <div className="text-center text-xs font-bold text-slate-400">5</div>
          </div>
          {matrix.map((row, rIdx) => (
            <>
              {row.map((cellRisks, cIdx) => {
                const prob = 5 - rIdx;
                const imp = cIdx + 1;
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`aspect-square border-2 rounded-xl p-2 transition-all flex flex-col justify-between relative shadow-sm ${getCellColor(prob, imp)}`}
                  >
                    <div className="absolute top-1 left-2 text-[10px] font-bold opacity-30 dark:opacity-40">{prob}x{imp}</div>
                    <div className="flex-1 flex flex-wrap content-center justify-center gap-1.5 mt-2">
                      {cellRisks.map((r: any) => (
                        <div
                          key={r.id}
                          onClick={() => onSelectRisk(r)}
                          className="w-6 h-6 bg-slate-800 dark:bg-white rounded-full shadow-md flex items-center justify-center text-xs font-bold text-white dark:text-slate-900 cursor-pointer hover:scale-110 hover:ring-2 hover:ring-primary-500 transition-all z-10"
                          title={r.title}
                        >
                          R{r.id}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ))}
        </div>
        <div className="text-center mt-6">
          <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Impact (1-5)
          </span>
        </div>
      </div>
    </div>
  );
};
