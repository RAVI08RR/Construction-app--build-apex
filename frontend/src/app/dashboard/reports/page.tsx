'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '../DashboardContext';
import { api } from '@/utils/api';
import { Camera, CloudUpload, HardHat, ShieldAlert, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DailyReportsPage() {
  const { activeProjectId, activeRole, triggerRefresh } = useDashboard();
  const [reports, setReports] = useState<any[]>([]);
  const [photoGallery, setPhotoGallery] = useState<any[]>([]);
  const [safetyLogs, setSafetyLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [reportWork, setReportWork] = useState('');
  const [reportLabour, setReportLabour] = useState(25);
  const [reportWeather, setReportWeather] = useState('Sunny - 32°C');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await api.get<any>('/dashboard/metrics');
      if (res.data) {
        // Build mock safety and reports list from audit logs & metrics
        setReports([
          { id: 'rep-1', date: '2026-06-20', work: 'Cast columns for floor 1. Brickwork completed on North face.', labour: res.data.metrics.labourPresent, weather: 'Sunny - 32°C', reporter: 'Arun Patel' }
        ]);
        setPhotoGallery([
          { id: 'img-1', url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80', caption: 'Floor 1 columns casting work' }
        ]);
        setSafetyLogs([
          { id: 's-1', title: 'Hardhats & Safety harness compliance audit', status: 'PASSED', date: '2026-06-20' },
          { id: 's-2', title: 'Scaffolding stability inspection', status: 'WARNING', date: '2026-06-19' }
        ]);
      }
      setLoading(false);
    };
    fetchData();
  }, [activeProjectId]);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    confetti({ particleCount: 80, spread: 50 });

    const newReport = {
      id: `rep-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      work: reportWork,
      labour: reportLabour,
      weather: reportWeather,
      reporter: activeRole === 'OWNER' ? 'Rajesh Sharma' : 'Vikram Malhotra'
    };

    setReports(prev => [newReport, ...prev]);
    setReportWork('');
    
    await api.post('/reports', {
      projectId: activeProjectId,
      workCompleted: reportWork,
      labourCount: reportLabour,
      reportDate: new Date(),
    });
    triggerRefresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-400">Loading site reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight">Daily Site Reports</h1>
          <p className="text-sm text-slate-400">Log daily contractor activities, workforce size, weather logs, and site photos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form */}
          {activeRole !== 'CLIENT' && (
            <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Submit Daily Progress Log</h3>
              <form onSubmit={handleCreateReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Work Completed Today</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe casting, foundations, plumbing, or finishing activities..."
                    value={reportWork}
                    onChange={e => setReportWork(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Labour Count Present</label>
                    <input
                      type="number"
                      required
                      value={reportLabour}
                      onChange={e => setReportLabour(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Weather State</label>
                    <input
                      type="text"
                      required
                      value={reportWeather}
                      onChange={e => setReportWeather(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10 cursor-pointer"
                >
                  Submit Daily Site Report
                </button>
              </form>
            </div>
          )}

          {/* History */}
          <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Activity Log History</h3>
            <div className="space-y-4">
              {reports.map((rep, idx) => (
                <div key={rep.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-brand-500">Report Date: {rep.date}</span>
                    <span className="text-slate-400">Weather: {rep.weather} • Labour: {rep.labour}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-350 leading-relaxed">{rep.work}</p>
                  <div className="text-[10px] text-slate-400 pt-2 border-t dark:border-slate-850 text-right font-semibold">Submitted by {rep.reporter}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Photos & Safety */}
        <div className="space-y-6">
          {/* Photo Gallery */}
          <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Site Photo Stream</h3>
            <div className="grid grid-cols-1 gap-4">
              {photoGallery.map(img => (
                <div key={img.id} className="group relative rounded-xl overflow-hidden border dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-950">
                  <img src={img.url} alt={img.caption} className="w-full h-40 object-cover group-hover:scale-102 transition-transform duration-300" />
                  <div className="p-3 bg-white dark:bg-slate-900 border-t dark:border-slate-850 text-xs font-bold text-center">
                    {img.caption}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Compliance */}
          <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <HardHat className="w-4 h-4 text-yellow-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Safety Compliance Audits</h3>
            </div>
            <div className="space-y-3">
              {safetyLogs.map(log => (
                <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-xl flex items-center justify-between text-xs font-bold">
                  <span className="truncate max-w-[180px]">{log.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border ${
                    log.status === 'PASSED'
                      ? 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/20'
                      : 'bg-accent-rose/15 text-accent-rose border-accent-rose/20'
                  }`}>{log.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
