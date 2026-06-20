'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '../DashboardContext';
import { api } from '@/utils/api';
import { FileSpreadsheet, Plus, Pencil, X, TrendingUp, AlertTriangle, Check, Download } from 'lucide-react';

const CATEGORIES = ['Earthwork', 'Concrete', 'Masonry', 'Steel', 'Plumbing', 'Electrical', 'Finishing', 'Landscaping', 'Safety'];

const DEFAULT_ITEMS = [
  { id: 'boq-1', category: 'Earthwork', description: 'Excavation in all soils including loading and dumping', unit: 'cum', plannedQty: 1200, actualQty: 1200, plannedRate: 150, actualRate: 150 },
  { id: 'boq-2', category: 'Concrete', description: 'RCC M25 grade in columns & beams', unit: 'cum', plannedQty: 350, actualQty: 280, plannedRate: 8500, actualRate: 8750 },
  { id: 'boq-3', category: 'Masonry', description: 'AAC block masonry in cement mortar 1:4', unit: 'sqm', plannedQty: 1800, actualQty: 900, plannedRate: 1100, actualRate: 1100 },
  { id: 'boq-4', category: 'Steel', description: 'TMT 500D rebars for slab & columns', unit: 'MT', plannedQty: 85, actualQty: 68, plannedRate: 65000, actualRate: 67500 },
  { id: 'boq-5', category: 'Finishing', description: 'Vitrified tiles & plastic emulsion paint', unit: 'sqm', plannedQty: 2200, actualQty: 220, plannedRate: 750, actualRate: 780 },
  { id: 'boq-6', category: 'Plumbing', description: 'CPVC internal plumbing with all fixtures', unit: 'pts', plannedQty: 120, actualQty: 30, plannedRate: 12000, actualRate: 12500 },
];

const EMPTY_FORM = { category: 'Earthwork', description: '', unit: 'sqm', plannedQty: '', actualQty: '', plannedRate: '', actualRate: '' };

const fmt = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

export default function BOQPage() {
  const { activeProjectId } = useDashboard();
  const [boqItems, setBoqItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get<any>('/dashboard/metrics').then(res => {
      if (res.data?.boqItems && res.data.boqItems.length > 0) {
        setBoqItems(res.data.boqItems);
      } else {
        setBoqItems(DEFAULT_ITEMS);
      }
      setLoading(false);
    });
  }, [activeProjectId]);

  const handleOpenAdd = () => { setForm({ ...EMPTY_FORM }); setEditMode(false); setSelected(null); setModalOpen(true); };
  const handleOpenEdit = (item: any) => {
    setForm({ category: item.category, description: item.description, unit: item.unit, plannedQty: item.plannedQty, actualQty: item.actualQty, plannedRate: item.plannedRate, actualRate: item.actualRate });
    setSelected(item); setEditMode(true); setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, plannedQty: Number(form.plannedQty), actualQty: Number(form.actualQty), plannedRate: Number(form.plannedRate), actualRate: Number(form.actualRate) };
    if (editMode && selected) {
      setBoqItems(prev => prev.map(i => i.id === selected.id ? { ...i, ...payload } : i));
    } else {
      setBoqItems(prev => [...prev, { id: `boq-${Date.now()}`, ...payload }]);
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = (id: string) => { setBoqItems(prev => prev.filter(i => i.id !== id)); setDeleteConfirm(null); };

  const calcVariance = (item: any) => (Number(item.actualQty) * Number(item.actualRate)) - (Number(item.plannedQty) * Number(item.plannedRate));

  const totalPlanned = boqItems.reduce((s, i) => s + Number(i.plannedQty) * Number(i.plannedRate), 0);
  const totalActual = boqItems.reduce((s, i) => s + Number(i.actualQty) * Number(i.actualRate), 0);
  const totalVariance = totalActual - totalPlanned;
  const overItems = boqItems.filter(i => calcVariance(i) > 0).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-400">Loading BOQ estimates...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-500" /> BOQ Estimates
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Bill of Quantities — planned vs. actual cost variance tracking for each work item.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 cursor-pointer transition-all">
            <Plus className="w-3.5 h-3.5" /> Add BOQ Item
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total BOQ Items', value: boqItems.length, color: 'text-indigo-500' },
          { label: 'Planned Cost', value: `₹${(totalPlanned / 10000000).toFixed(2)} Cr`, color: 'text-blue-500' },
          { label: 'Actual Cost', value: `₹${(totalActual / 10000000).toFixed(2)} Cr`, color: totalActual > totalPlanned ? 'text-red-500' : 'text-emerald-500' },
          { label: 'Cost Variance', value: `${totalVariance > 0 ? '+' : ''}${fmt(totalVariance)}`, color: totalVariance > 0 ? 'text-red-500' : 'text-emerald-500' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
            <div className={`text-base sm:text-xl font-extrabold font-display ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Over-budget Alert */}
      {overItems > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-red-600 dark:text-red-400">{overItems} BOQ item(s) are over budget</span>
            <span className="text-red-500/80 ml-2">— Raise change orders or renegotiate vendor rates immediately.</span>
          </div>
        </div>
      )}

      {/* BOQ Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Bill of Quantities Sheet ({boqItems.length} items)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Work Description</th>
                <th className="py-3 px-4 text-center">Unit</th>
                <th className="py-3 px-4 text-right">Planned Qty</th>
                <th className="py-3 px-4 text-right">Actual Qty</th>
                <th className="py-3 px-4 text-right">Planned Rate</th>
                <th className="py-3 px-4 text-right">Actual Rate</th>
                <th className="py-3 px-4 text-right">Variance</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {boqItems.map(item => {
                const variance = calcVariance(item);
                const completion = Number(item.plannedQty) > 0 ? Math.min(100, Math.round((Number(item.actualQty) / Number(item.plannedQty)) * 100)) : 0;
                return (
                  <tr key={item.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${variance > 0 ? 'border-l-2 border-l-red-400' : variance < 0 ? 'border-l-2 border-l-emerald-400' : ''}`}>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[9px] font-extrabold uppercase">{item.category}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium max-w-[200px]">
                      <div className="truncate">{item.description}</div>
                      <div className="mt-1 w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1 overflow-hidden">
                        <div className="h-1 rounded-full bg-indigo-500" style={{ width: `${completion}%` }}></div>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{completion}% complete</div>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">{item.unit}</td>
                    <td className="py-3 px-4 text-right font-bold">{Number(item.plannedQty).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-bold">{Number(item.actualQty).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-slate-500">{fmt(Number(item.plannedRate))}</td>
                    <td className="py-3 px-4 text-right text-slate-500">{fmt(Number(item.actualRate))}</td>
                    <td className={`py-3 px-4 text-right font-extrabold ${variance > 0 ? 'text-red-500' : variance < 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {variance > 0 ? '+' : ''}{fmt(variance)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleOpenEdit(item)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 text-slate-400 hover:text-amber-500 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-extrabold text-xs">
                <td colSpan={3} className="py-3 px-4 text-slate-500 uppercase tracking-wider">TOTAL PROJECT COST</td>
                <td colSpan={2} className="py-3 px-4"></td>
                <td className="py-3 px-4 text-right text-blue-500">{fmt(totalPlanned)}</td>
                <td className="py-3 px-4 text-right text-blue-500">{fmt(totalActual)}</td>
                <td className={`py-3 px-4 text-right ${totalVariance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{totalVariance > 0 ? '+' : ''}{fmt(totalVariance)}</td>
                <td className="py-3 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-display font-bold text-sm">{editMode ? 'Edit BOQ Item' : 'Add BOQ Item'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category *</label>
                  <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none cursor-pointer">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Unit</label>
                  <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500" placeholder="sqm / cum / MT" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Work Description *</label>
                  <input required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500" placeholder="Describe the work item..." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Planned Qty *</label>
                  <input required type="number" value={form.plannedQty} onChange={e => setForm(f => ({ ...f, plannedQty: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500" placeholder="1200" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Actual Qty</label>
                  <input type="number" value={form.actualQty} onChange={e => setForm(f => ({ ...f, actualQty: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Planned Rate (₹) *</label>
                  <input required type="number" value={form.plannedRate} onChange={e => setForm(f => ({ ...f, plannedRate: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500" placeholder="150" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Actual Rate (₹)</label>
                  <input type="number" value={form.actualRate} onChange={e => setForm(f => ({ ...f, actualRate: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500" placeholder="0" />
                </div>
              </div>
              {form.plannedQty && form.plannedRate && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25 rounded-xl text-xs font-bold">
                  Planned Cost: <span className="text-indigo-600 dark:text-indigo-400">{fmt(Number(form.plannedQty) * Number(form.plannedRate))}</span>
                  {form.actualQty && form.actualRate && (
                    <span className="ml-4">Actual Cost: <span className={Number(form.actualQty) * Number(form.actualRate) > Number(form.plannedQty) * Number(form.plannedRate) ? 'text-red-500' : 'text-emerald-500'}>{fmt(Number(form.actualQty) * Number(form.actualRate))}</span></span>
                  )}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-500/20">
                  {editMode ? 'Update Item' : 'Add to BOQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-bold text-center mb-2">Remove BOQ Item?</h3>
            <p className="text-xs text-slate-400 text-center mb-5">This item will be permanently removed from the BOQ sheet.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl cursor-pointer">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
