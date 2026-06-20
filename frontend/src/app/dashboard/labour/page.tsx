'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../DashboardContext';
import { api } from '@/utils/api';
import { HardHat, Plus, Search, X, Pencil, Trash2, Sun, Moon, UserCheck, ClipboardList } from 'lucide-react';

const TRADES = ['Mason', 'Painter', 'Electrician', 'Plumber', 'Carpenter', 'Steel Fixer', 'Welder', 'Helper', 'Supervisor', 'Safety Officer'];
const SHIFTS = ['DAY', 'NIGHT', 'DOUBLE'];
const CATEGORIES = ['SKILLED', 'SEMI_SKILLED', 'UNSKILLED'];

const EMPTY_FORM = { projectId: '', date: '', trade: 'Mason', category: 'SKILLED', shift: 'DAY', count: '', wagePerDay: '', supervisorName: '', remarks: '' };

export default function LabourPage() {
  const { activeProjectId, projects } = useDashboard();
  const [labourLogs, setLabourLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Local in-memory store (synced with /hrms/labour API)
  const [localLogs, setLocalLogs] = useState<any[]>([
    { id: 'lab-1', projectId: 'project-1', date: new Date().toISOString(), trade: 'Mason', category: 'SKILLED', shift: 'DAY', count: 10, wagePerDay: 750, supervisorName: 'Sunil Verma', remarks: 'Brickwork on north face - floor 2', totalWage: 7500 },
    { id: 'lab-2', projectId: 'project-1', date: new Date().toISOString(), trade: 'Electrician', category: 'SKILLED', shift: 'DAY', count: 3, wagePerDay: 900, supervisorName: 'Power Grid Crew', remarks: 'Internal wiring - ground floor', totalWage: 2700 },
    { id: 'lab-3', projectId: 'project-1', date: new Date().toISOString(), trade: 'Painter', category: 'SEMI_SKILLED', shift: 'DAY', count: 6, wagePerDay: 600, supervisorName: 'Nippon Crew', remarks: 'Primer coat - ground floor exterior', totalWage: 3600 },
    { id: 'lab-4', projectId: 'project-1', date: new Date().toISOString(), trade: 'Helper', category: 'UNSKILLED', shift: 'DAY', count: 12, wagePerDay: 450, supervisorName: 'Sunil Verma', remarks: 'Material loading and site cleanup', totalWage: 5400 },
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await api.get<any[]>('/hrms/labour');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      setLabourLogs(res.data);
    } else {
      setLabourLogs(localLogs);
    }
    setLoading(false);
  }, [localLogs]);

  useEffect(() => { fetchData(); }, [activeProjectId]);

  const displayLogs = labourLogs.length > 0 ? labourLogs : localLogs;

  const handleOpenAdd = () => {
    setForm({ ...EMPTY_FORM, projectId: activeProjectId, date: new Date().toISOString().slice(0, 10) });
    setEditMode(false); setSelected(null); setModalOpen(true);
  };

  const handleOpenEdit = (log: any) => {
    setForm({ projectId: log.projectId || activeProjectId, date: log.date?.slice(0, 10) || '', trade: log.trade || 'Mason', category: log.category || 'SKILLED', shift: log.shift || 'DAY', count: log.count || log.labourCount || '', wagePerDay: log.wagePerDay || '', supervisorName: log.supervisorName || '', remarks: log.remarks || '' });
    setSelected(log); setEditMode(true); setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, count: Number(form.count), wagePerDay: Number(form.wagePerDay), totalWage: Number(form.count) * Number(form.wagePerDay) };
    
    if (editMode && selected) {
      const updated = localLogs.map(l => l.id === selected.id ? { ...l, ...payload } : l);
      setLocalLogs(updated);
      setLabourLogs(updated);
    } else {
      const newLog = { id: `lab-${Date.now()}`, ...payload, createdAt: new Date().toISOString() };
      const updated = [newLog, ...localLogs];
      setLocalLogs(updated);
      setLabourLogs(updated);
      // Also try API
      await api.post('/hrms/labour', payload);
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = localLogs.filter(l => l.id !== id);
    setLocalLogs(updated);
    setLabourLogs(updated);
    setDeleteConfirm(null);
  };

  const filtered = displayLogs.filter(log =>
    (log.trade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     log.supervisorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     log.remarks?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    totalWorkers: displayLogs.reduce((s, l) => s + (Number(l.count) || Number(l.labourCount) || 0), 0),
    totalWage: displayLogs.reduce((s, l) => s + (l.totalWage || (Number(l.count) * Number(l.wagePerDay)) || 0), 0),
    trades: [...new Set(displayLogs.map(l => l.trade).filter(Boolean))].length,
    logs: displayLogs.length,
  };

  const tradeBreakdown = TRADES.map(trade => ({
    trade,
    count: displayLogs.filter(l => l.trade === trade).reduce((s, l) => s + (Number(l.count) || Number(l.labourCount) || 0), 0),
  })).filter(t => t.count > 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-400">Loading labour contractor sheets...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2">
            <HardHat className="w-6 h-6 text-amber-500" /> Labour Shift Logs
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Track daily contractor workforce by trade, wages, and shift deployment.</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer transition-all">
          <Plus className="w-3.5 h-3.5" /> Log Labour
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Workers Today', value: stats.totalWorkers, color: 'text-amber-500' },
          { label: 'Log Entries', value: stats.logs, color: 'text-blue-500' },
          { label: 'Trades Active', value: stats.trades, color: 'text-purple-500' },
          { label: 'Daily Wage Bill', value: `₹${(stats.totalWage).toLocaleString('en-IN')}`, color: 'text-emerald-500', small: true },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
            <div className={`${s.small ? 'text-base' : 'text-2xl'} font-extrabold font-display ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Trade Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">Trade Breakdown</h3>
          <div className="space-y-3">
            {tradeBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">No data yet</p>
            ) : tradeBreakdown.map(t => (
              <div key={t.trade} className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">{t.trade}</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">{t.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Log table */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search trade, supervisor..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-amber-500" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Trade</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Supervisor</th>
                  <th className="py-3 px-4 text-center">Count</th>
                  <th className="py-3 px-4 text-right">Daily Wage</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">No labour logs found. <button onClick={handleOpenAdd} className="text-amber-500 font-bold underline cursor-pointer ml-1">Add entry</button></td></tr>
                ) : filtered.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-medium">{new Date(log.date || log.reportDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">{log.trade || 'General'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${log.category === 'SKILLED' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : log.category === 'SEMI_SKILLED' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}>{log.category || 'GENERAL'}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{log.supervisorName || log.supervisorId || '—'}</td>
                    <td className="py-3 px-4 text-center font-extrabold text-amber-500">{log.count || log.labourCount}</td>
                    <td className="py-3 px-4 text-right text-slate-400 font-medium">{log.wagePerDay ? `₹${Number(log.wagePerDay).toLocaleString('en-IN')}` : '—'}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {log.totalWage ? `₹${Number(log.totalWage).toLocaleString('en-IN')}` : log.wagePerDay && log.count ? `₹${(Number(log.count) * Number(log.wagePerDay)).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleOpenEdit(log)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 text-slate-400 hover:text-amber-500 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteConfirm(log.id)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-display font-bold text-sm">{editMode ? 'Edit Labour Log' : 'Log Labour Shift'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Date *</label>
                  <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Trade *</label>
                  <select required value={form.trade} onChange={e => setForm(f => ({ ...f, trade: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none cursor-pointer">
                    {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none cursor-pointer">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Shift</label>
                  <select value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none cursor-pointer">
                    {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Worker Count *</label>
                  <input required type="number" value={form.count} onChange={e => setForm(f => ({ ...f, count: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-amber-500" placeholder="10" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Wage Per Day (₹)</label>
                  <input type="number" value={form.wagePerDay} onChange={e => setForm(f => ({ ...f, wagePerDay: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-amber-500" placeholder="750" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Supervisor / Contractor Name</label>
                  <input value={form.supervisorName} onChange={e => setForm(f => ({ ...f, supervisorName: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-amber-500" placeholder="Sunil Verma Co" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Work Remarks</label>
                  <textarea rows={2} value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-amber-500 resize-none" placeholder="Describe work performed..." />
                </div>
              </div>
              {form.count && form.wagePerDay && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 rounded-xl text-xs font-bold">
                  Total Daily Wage: <span className="text-emerald-600 dark:text-emerald-400 text-sm">₹{(Number(form.count) * Number(form.wagePerDay)).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer">
                  {saving ? 'Saving...' : editMode ? 'Update Log' : 'Log Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-bold text-center mb-2">Delete Labour Log?</h3>
            <p className="text-xs text-slate-400 text-center mb-5">This record will be permanently removed.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
