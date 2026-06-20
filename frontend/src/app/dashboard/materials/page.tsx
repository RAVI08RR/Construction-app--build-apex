'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../DashboardContext';
import { api } from '@/utils/api';
import { Layers, Plus, Search, AlertTriangle, Pencil, Trash2, TrendingUp, Package, X, ChevronDown } from 'lucide-react';

const CATEGORIES = ['Cement', 'Steel', 'Sand & Aggregate', 'Masonry', 'Formwork', 'Electrical', 'Plumbing', 'Finishing', 'Safety'];

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  ADEQUATE: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/25', label: 'Adequate' },
  LOW_STOCK: { color: 'text-amber-600', bg: 'bg-amber-500/10 border border-amber-500/25', label: 'Low Stock' },
  CRITICAL: { color: 'text-red-500', bg: 'bg-red-500/10 border border-red-500/25', label: 'Critical' },
};

const STOCK_BAR_COLORS: Record<string, string> = {
  ADEQUATE: 'bg-emerald-500',
  LOW_STOCK: 'bg-amber-500',
  CRITICAL: 'bg-red-500',
};

const EMPTY_FORM = { name: '', category: 'Cement', unit: 'bags', currentStock: '', totalCapacity: '', reorderLevel: '', unitPrice: '', supplier: '' };

export default function MaterialsPage() {
  const { activeProjectId } = useDashboard();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    const res = await api.get<any[]>('/materials');
    if (res.data && Array.isArray(res.data)) {
      setMaterials(res.data);
    } else {
      setMaterials([
        { id: 'mat-1', name: 'OPC Cement (bags)', category: 'Cement', unit: 'bags', currentStock: 450, totalCapacity: 1000, reorderLevel: 200, unitPrice: 380, supplier: 'UltraTech Cement', status: 'LOW_STOCK', stockPercent: 45 },
        { id: 'mat-2', name: 'TMT Steel (tons)', category: 'Steel', unit: 'tons', currentStock: 18, totalCapacity: 25, reorderLevel: 5, unitPrice: 65000, supplier: 'Tata Tiscon', status: 'ADEQUATE', stockPercent: 72 },
        { id: 'mat-6', name: 'Plywood Formwork (sheets)', category: 'Formwork', unit: 'sheets', currentStock: 8, totalCapacity: 150, reorderLevel: 30, unitPrice: 2200, supplier: 'Century Ply', status: 'CRITICAL', stockPercent: 5 },
      ]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials, activeProjectId]);

  const handleOpenAdd = () => { setForm({ ...EMPTY_FORM }); setEditMode(false); setSelected(null); setModalOpen(true); };
  const handleOpenEdit = (m: any) => {
    setForm({ name: m.name || '', category: m.category || 'Cement', unit: m.unit || 'bags', currentStock: m.currentStock || '', totalCapacity: m.totalCapacity || '', reorderLevel: m.reorderLevel || '', unitPrice: m.unitPrice || '', supplier: m.supplier || '' });
    setSelected(m); setEditMode(true); setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, currentStock: Number(form.currentStock), totalCapacity: Number(form.totalCapacity), reorderLevel: Number(form.reorderLevel), unitPrice: Number(form.unitPrice) };
    if (editMode && selected) { await api.put(`/materials/${selected.id}`, payload); }
    else { await api.post('/materials', payload); }
    await fetchMaterials();
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/materials/${id}`);
    setDeleteConfirm(null);
    await fetchMaterials();
  };

  const filtered = materials.filter(m => {
    const matchS = m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.category?.toLowerCase().includes(searchTerm.toLowerCase()) || m.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchF = statusFilter === 'ALL' || m.status === statusFilter;
    return matchS && matchF;
  });

  const criticalCount = materials.filter(m => m.status === 'CRITICAL').length;
  const lowStockCount = materials.filter(m => m.status === 'LOW_STOCK').length;
  const totalValue = materials.reduce((s, m) => s + (m.currentStock * m.unitPrice || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-400">Loading materials inventory...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-orange-500" /> Materials Inventory
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Track raw material stock levels, reorder points, and AI depletion forecasts.</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 cursor-pointer transition-all">
          <Plus className="w-3.5 h-3.5" /> Add Material
        </button>
      </div>

      {/* Alert Banner */}
      {(criticalCount > 0 || lowStockCount > 0) && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <div className="text-xs font-bold text-red-600 dark:text-red-400">⚠ Stock Alert</div>
            <div className="text-[10px] text-red-500/80 mt-0.5">
              {criticalCount > 0 && <span className="font-bold">{criticalCount} material(s) at CRITICAL level</span>}
              {criticalCount > 0 && lowStockCount > 0 && ' • '}
              {lowStockCount > 0 && <span>{lowStockCount} material(s) LOW STOCK</span>}
              {' — Raise purchase orders now.'}
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Materials', value: materials.length, color: 'text-orange-500', icon: Package },
          { label: 'Critical Items', value: criticalCount, color: 'text-red-500', icon: AlertTriangle },
          { label: 'Low Stock', value: lowStockCount, color: 'text-amber-500', icon: TrendingUp },
          { label: 'Stock Value', value: `₹${(totalValue / 100000).toFixed(1)}L`, color: 'text-emerald-500', icon: Layers },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${s.color === 'text-red-500' ? 'bg-red-500/10' : s.color === 'text-amber-500' ? 'bg-amber-500/10' : s.color === 'text-emerald-500' ? 'bg-emerald-500/10' : 'bg-orange-500/10'} flex items-center justify-center`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <div className={`text-xl font-extrabold font-display ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-400 font-semibold">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search material name, category, supplier..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-orange-500 transition-colors" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none cursor-pointer">
          <option value="ALL">All Status</option>
          <option value="ADEQUATE">Adequate</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      {/* Materials Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Stock Registry ({filtered.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-400 font-semibold text-xs">No materials found. <button onClick={handleOpenAdd} className="text-orange-500 font-bold underline ml-1 cursor-pointer">Add material</button></td></tr>
              ) : filtered.map(mat => {
                const pct = mat.stockPercent ?? Math.round((mat.currentStock / mat.totalCapacity) * 100);
                const style = STATUS_STYLES[mat.status] || STATUS_STYLES.ADEQUATE;
                return (
                  <tr key={mat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-white">{mat.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{mat.currentStock} {mat.unit} remaining</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">{mat.category}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">{mat.supplier || '—'}</td>
                    <td className="py-3.5 px-4 min-w-[140px]">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1.5 font-semibold">
                        <span>{mat.currentStock} / {mat.totalCapacity} {mat.unit}</span>
                        <span className={style.color}>{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full transition-all ${STOCK_BAR_COLORS[mat.status] || 'bg-emerald-500'}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold">₹{Number(mat.unitPrice).toLocaleString('en-IN')}/{mat.unit}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${style.bg} ${style.color}`}>{style.label}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleOpenEdit(mat)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 text-slate-400 hover:text-amber-500 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteConfirm(mat.id)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-display font-bold text-sm">{editMode ? 'Edit Material' : 'Add Material to Inventory'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Material Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-orange-500" placeholder="e.g. OPC Cement (bags)" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category *</label>
                  <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none cursor-pointer">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Unit</label>
                  <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-orange-500" placeholder="bags / tons / sqm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Current Stock *</label>
                  <input required type="number" value={form.currentStock} onChange={e => setForm(f => ({ ...f, currentStock: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-orange-500" placeholder="450" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Total Capacity *</label>
                  <input required type="number" value={form.totalCapacity} onChange={e => setForm(f => ({ ...f, totalCapacity: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-orange-500" placeholder="1000" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Reorder Level</label>
                  <input type="number" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-orange-500" placeholder="200" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Unit Price (₹)</label>
                  <input type="number" value={form.unitPrice} onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-orange-500" placeholder="380" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Supplier</label>
                  <input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-orange-500" placeholder="UltraTech Cement" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 cursor-pointer">
                  {saving ? 'Saving...' : editMode ? 'Update Stock' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-bold text-center mb-2">Remove Material?</h3>
            <p className="text-xs text-slate-400 text-center mb-5">This material record will be removed from inventory.</p>
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
