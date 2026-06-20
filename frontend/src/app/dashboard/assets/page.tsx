'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../DashboardContext';
import { api } from '@/utils/api';
import { Wrench, Plus, Search, Pencil, Trash2, Eye, X, QrCode, UserCheck, RotateCcw } from 'lucide-react';

const CATEGORIES = ['MACHINERY', 'VEHICLE', 'ELECTRONIC', 'SAFETY_GEAR', 'TOOLS', 'FURNITURE'];
const EMPTY_FORM = { name: '', assetId: '', category: 'MACHINERY', value: '', purchaseDate: '', status: 'AVAILABLE' };

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25',
  ASSIGNED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25',
  MAINTENANCE: 'bg-amber-500/10 text-amber-500 border border-amber-500/25',
  DISPOSED: 'bg-red-500/10 text-red-500 border border-red-500/25',
};

export default function AssetsPage() {
  const { activeProjectId } = useDashboard();
  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [scannedAsset, setScannedAsset] = useState<any>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [assetsRes, empRes] = await Promise.all([
      api.get<any[]>('/assets'),
      api.get<any[]>('/employees'),
    ]);
    if (assetsRes.data && Array.isArray(assetsRes.data)) setAssets(assetsRes.data);
    else {
      // Fallback
      const metrics = await api.get<any>('/dashboard/metrics');
      setAssets(metrics.data?.assets || []);
    }
    if (empRes.data && Array.isArray(empRes.data)) setEmployees(empRes.data);
    else {
      const metrics = await api.get<any>('/dashboard/metrics');
      setEmployees(metrics.data?.employees || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll, activeProjectId]);

  const handleOpenAdd = () => { setForm({ ...EMPTY_FORM }); setEditMode(false); setSelected(null); setModalOpen(true); };
  const handleOpenEdit = (a: any) => {
    setForm({ name: a.name || '', assetId: a.assetId || '', category: a.category || 'MACHINERY', value: a.value || '', purchaseDate: a.purchaseDate ? a.purchaseDate.slice(0, 10) : '', status: a.status || 'AVAILABLE' });
    setSelected(a); setEditMode(true); setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, value: Number(form.value) };
    if (editMode && selected) { await api.put(`/assets/${selected.id}`, payload); }
    else { await api.post('/assets', payload); }
    await fetchAll();
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/assets/${id}`);
    setDeleteConfirm(null);
    await fetchAll();
  };

  const handleAssign = async () => {
    if (!selected || !assignEmployeeId) return;
    setSaving(true);
    await api.post(`/assets/${selected.id}/assign`, { employeeId: assignEmployeeId });
    await fetchAll();
    setSaving(false);
    setAssignModalOpen(false);
    setAssignEmployeeId('');
  };

  const handleReturn = async (assetId: string) => {
    await api.post(`/assets/${assetId}/return`, {});
    await fetchAll();
  };

  const filtered = assets.filter(a => {
    const matchS = a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || a.assetId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchC = catFilter === 'ALL' || a.category === catFilter;
    return matchS && matchC;
  });

  const stats = {
    total: assets.length,
    available: assets.filter(a => a.status === 'AVAILABLE').length,
    assigned: assets.filter(a => a.status === 'ASSIGNED').length,
    totalValue: assets.reduce((s, a) => s + (Number(a.value) || 0), 0),
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-400">Loading asset inventory...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-violet-500" /> Asset QR Inventory
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Track construction equipment, laptops, tools — assign, return, and scan via QR codes.</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-500/20 cursor-pointer transition-all">
          <Plus className="w-3.5 h-3.5" /> Register Asset
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: stats.total, color: 'text-violet-500' },
          { label: 'Available', value: stats.available, color: 'text-emerald-500' },
          { label: 'Assigned', value: stats.assigned, color: 'text-blue-500' },
          { label: 'Total Value', value: `₹${(stats.totalValue / 100000).toFixed(1)}L`, color: 'text-brand-500' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
            <div className={`text-2xl font-extrabold font-display ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* QR Scan Simulator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
        <QrCode className="w-8 h-8 text-violet-500 shrink-0" />
        <div className="flex-1">
          <div className="text-xs font-bold mb-1">QR Code Asset Scanner</div>
          <p className="text-[10px] text-slate-400 font-medium">Simulate scanning a QR code to instantly pull asset details:</p>
        </div>
        <select onChange={e => { const a = assets.find(a => a.assetId === e.target.value); setScannedAsset(a || null); }}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none cursor-pointer min-w-[200px]">
          <option value="">Simulate QR Scan...</option>
          {assets.map(a => <option key={a.assetId} value={a.assetId}>{a.assetId} — {a.name}</option>)}
        </select>
      </div>

      {/* QR scan result */}
      {scannedAsset && (
        <div className="flex items-center gap-4 p-4 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/25 rounded-2xl animate-scale-up">
          <img src={scannedAsset.qrCodeUrl} alt="QR" className="w-14 h-14 rounded-xl border bg-white p-0.5" />
          <div className="flex-1">
            <div className="text-xs font-extrabold text-violet-600 dark:text-violet-400">✓ QR Scanned: {scannedAsset.assetId}</div>
            <div className="font-bold text-sm mt-0.5">{scannedAsset.name}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Category: {scannedAsset.category} • Operator: {scannedAsset.operatorName || 'Unassigned'}</div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${STATUS_STYLES[scannedAsset.status] || ''}`}>{scannedAsset.status}</span>
          <button onClick={() => setScannedAsset(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-violet-100 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search asset name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-violet-500" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none cursor-pointer">
          <option value="ALL">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Assets Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Equipment Assets Registry ({filtered.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Asset ID</th>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4 text-center">QR Code</th>
                <th className="py-3 px-4 text-right">Value</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-400 font-semibold">No assets found. <button onClick={handleOpenAdd} className="text-violet-500 font-bold underline cursor-pointer ml-1">Register one</button></td></tr>
              ) : filtered.map(asset => (
                <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{asset.assetId}</td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">{asset.name}</td>
                  <td className="py-3 px-4 text-slate-400 font-medium">{asset.category}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{asset.operatorName || 'Unassigned'}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center">
                      {asset.qrCodeUrl ? <img src={asset.qrCodeUrl} alt="QR" className="h-9 w-9 border dark:border-slate-700 p-0.5 rounded bg-white" /> : <span className="text-slate-400 text-[10px]">—</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold">{asset.value ? `₹${Number(asset.value).toLocaleString('en-IN')}` : '—'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${STATUS_STYLES[asset.status] || ''}`}>{asset.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setSelected(asset); setViewModalOpen(true); }} title="View" className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 text-slate-400 hover:text-violet-500 cursor-pointer"><Eye className="w-3.5 h-3.5" /></button>
                      {asset.status === 'AVAILABLE' && (
                        <button onClick={() => { setSelected(asset); setAssignModalOpen(true); }} title="Assign" className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-400 hover:text-blue-500 cursor-pointer"><UserCheck className="w-3.5 h-3.5" /></button>
                      )}
                      {asset.status === 'ASSIGNED' && (
                        <button onClick={() => handleReturn(asset.id)} title="Return" className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /></button>
                      )}
                      <button onClick={() => handleOpenEdit(asset)} title="Edit" className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 text-slate-400 hover:text-amber-500 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteConfirm(asset.id)} title="Delete" className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-display font-bold text-sm">{editMode ? 'Edit Asset' : 'Register New Asset'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Asset Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-violet-500" placeholder="e.g. CAT Excavator 320D" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Asset ID / Code</label>
                  <input value={form.assetId} onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-violet-500" placeholder="AST-EXC-002 (auto if blank)" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category *</label>
                  <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none cursor-pointer">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Purchase Value (₹)</label>
                  <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-violet-500" placeholder="4500000" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Purchase Date</label>
                  <input type="date" value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none cursor-pointer">
                    {['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'DISPOSED'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-500/20 cursor-pointer">
                  {saving ? 'Saving...' : editMode ? 'Update Asset' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModalOpen && selected && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="font-display font-bold text-sm mb-4">Assign Asset to Employee</h2>
            <p className="text-xs text-slate-400 mb-4">Assigning: <span className="font-bold text-slate-700 dark:text-slate-200">{selected.name}</span></p>
            <select value={assignEmployeeId} onChange={e => setAssignEmployeeId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none cursor-pointer mb-4">
              <option value="">Select employee...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.designation}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setAssignModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleAssign} disabled={!assignEmployeeId || saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer">
                {saving ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-bold text-center mb-2">Delete Asset?</h3>
            <p className="text-xs text-slate-400 text-center mb-5">This action will permanently remove the asset from the registry.</p>
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
