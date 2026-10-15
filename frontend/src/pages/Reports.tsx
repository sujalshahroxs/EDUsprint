import { useState, useEffect } from 'react';
import { fetchProjects, fetchSprints, fetchTasks, fetchRisks, fetchAnalytics } from '../services/api';
import { FileText, Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Reports() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchProjects().then(data => {
      setProjects(data);
      if (data.length > 0) setActiveProjectId(data[0].id.toString());
    });
  }, []);

  const generatePDF = async () => {
    if (!activeProjectId) return;
    setIsGenerating(true);
    try {
      const activeProject = projects.find(p => p.id.toString() === activeProjectId);
      const sprints = await fetchSprints(activeProjectId);
      const tasks = await fetchTasks(activeProjectId);
      const risks = await fetchRisks(activeProjectId);
      const analytics = await fetchAnalytics(activeProjectId);

      const doc = new jsPDF();

      // Title Page
      doc.setFontSize(28);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('EduSprint', 105, 60, { align: 'center' });

      doc.setFontSize(18);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text('Agile Project Planning and Risk Monitoring', 105, 80, { align: 'center' });
      doc.text('For an E-Learning Platform', 105, 90, { align: 'center' });

      doc.setFontSize(14);
      doc.text(`Project: ${activeProject?.name}`, 105, 120, { align: 'center' });
      doc.text(`Developed by: Sujal Shah`, 105, 140, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 150, { align: 'center' });

      doc.addPage();

      // Overview
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text('1. Project Overview', 14, 20);
      doc.setFontSize(12);
      doc.setTextColor(71, 85, 105);
      doc.text(`Name: ${activeProject?.name}`, 14, 30);
      doc.text(`Status: ${activeProject?.status}`, 14, 40);
      doc.text(`Timeline: ${activeProject?.startDate} to ${activeProject?.endDate}`, 14, 50);

      // Analytics Summary
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text('2. Executive Summary', 14, 70);
      doc.setFontSize(12);
      doc.setTextColor(71, 85, 105);
      doc.text(`Total Tasks: ${analytics.tasks.total}`, 14, 80);
      doc.text(`Completed Tasks: ${analytics.tasks.completed}`, 14, 90);
      doc.text(`Total Risks: ${risks.length}`, 14, 100);
      doc.text(`Critical Risks: ${analytics.risks.critical}`, 14, 110);

      // Sprints Table
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text('3. Sprints', 14, 130);

      autoTable(doc, {
        startY: 140,
        head: [['Sprint Name', 'Goal', 'Status', 'Dates']],
        body: sprints.map((s: any) => [s.name, s.goal, s.status, `${s.startDate} to ${s.endDate}`]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });

      // Tasks Summary Table
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text('4. Key Tasks', 14, 20);

      const topTasks = tasks.slice(0, 15); // Show first 15 tasks to save space
      autoTable(doc, {
        startY: 30,
        head: [['Title', 'Status', 'Priority', 'Assignee']],
        body: topTasks.map((t: any) => [t.title, t.status, t.priority, t.assignee]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }
      });

      // Risks Table
      doc.addPage();
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text('5. Risk Register', 14, 20);

      autoTable(doc, {
        startY: 30,
        head: [['Risk Title', 'Score', 'Severity', 'Mitigation']],
        body: risks.map((r: any) => [r.title, r.score, r.severity, r.mitigation]),
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38] }
      });

      doc.save('EduSprint_Project_Report.pdf');
    } catch (e) {
      console.error(e);
      alert('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="text-orange-600" />
          Project Reports
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Generate professional PDF documentation</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
        <div className="mb-8 max-w-md">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Project for Report</label>
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Comprehensive Project Report</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Includes project overview, sprint summary, task metrics, and complete risk register.</p>
            <ul className="text-sm text-slate-500 mb-6 space-y-2">
              <li>✓ Executive Summary</li>
              <li>✓ Task Distribution</li>
              <li>✓ Risk Analysis</li>
              <li>✓ Timeline Estimates</li>
            </ul>
            <button
              onClick={generatePDF}
              disabled={isGenerating || !activeProjectId}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-bold transition-colors"
            >
              {isGenerating ? 'Generating PDF...' : <><Download size={18} /> Download PDF Report</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
