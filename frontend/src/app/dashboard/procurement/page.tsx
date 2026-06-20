'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '../DashboardContext';
import { api } from '@/utils/api';
import { Truck, Plus, Search, CheckCircle, Clock, Send, Pencil, X, Package, FileText, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';

const VENDORS = ['UltraTech Cement', 'Tata Tiscon', 'Asian Paints', 'Hindware', 'Philips Electrical'];
const CATEGORIES = ['Cement & Concrete', 'Steel / Rebars', 'Electrical', 'Plumbing', 'Finishing', 'Machinery', 'Safety Equipment'];

const INIT_POS = [
  { id: 'PO-2026-001', vendor: 'UltraTech Cement', category: 'Cement & Concrete', item: '500 bags OPC 53 Grade Cement', amount: 190000, status: 'APPROVED', raised: '2026-06-18', expected: '2026-06-22', remarks: 'Urgent — slab casting this week' },
  { id: 'PO-2026-002', vendor: 'Tata Tiscon', category: 'Steel / Rebars', item: '10 MT TMT 500D Fe Rebars 16mm dia', amount: 675000, status: 'SENT', raised: '2026-06-19', expected: '2026-06-25', remarks: 'Confirm pricing with Vijay Raaz before delivery' },
  { id: 'PO-2026-003', vendor: 'Asian Paints', category: 'Finishing', item: '200 ltrs Apex Ultima Exterior Paint', amount: 55000, status: 'DRAFT', raised: '2026-06-20', expected: '2026-07-01', remarks: 'Pending client shade approval' },
  { id: 'PO-2026-004', vendor: 'Hindware', category: 'Plumbing', item: 'Bathroom fittings set — 8 units', amount: 320000, status: 'DELIVERED', raised: '2026-06-10', expected: '2026-06-15', remarks: 'Delivered, quality check done' },
];

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700',
  SENT: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25',
  APPROVED: 'bg-amber-500/10 text-amber-600 border border-amber-500/25',
  DELIVERED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25',
};

const EMPTY_FORM = { vendor: 'UltraTech Cement', category: 'Cement & Concrete', item: '', amount: '', raised: '', expected: '', remarks: '' };

const fmt = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

export default function ProcurementPage() {
  const { activeProjectId, activeRole } = useDashboard();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [poCounter, setPoCounter] = useState(5);

  useEffect(() => {
    setLoading(true);
    api.get<any>('/dashboard/metrics').then(res => {
      setOrders(INIT_POS);
      setLoading(false);
    });
  }, [activeProjectId]);

  const handleOpenAdd = () => { setForm({ ...EMPTY_FORM, raised: new Date().toISOString().slice(0, 10) }); setEditMode(false); setSelected(null); setModalOpen(true); };
  const handleOpenEdit = (o: any) => {
    setForm({ vendor: o.vendor, category: o.category, item: o.item, amount: o.amount, raised: o.raised, expected: o.expected, remarks: o.remarks || '' });
    setSelected(o); setEditMode(true); setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, amount: Number(form.amount) };
    if (editMode && selected) {
      setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, ...payload } : o));
    } else {
      const newId = `PO-2026-${String(poCounter).padStart(3, '0')}`;
      setPoCounter(c => c + 1);
      setOrders(prev => [{ id: newId, ...payload, status: 'DRAFT' }, ...prev]);
    }
    setSaving(false);
    setModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    if (newStatus === 'DELIVERED') confetti({ particleCount: 50, spread: 40 });
  };

  const handleDelete = (id: string) => setOrders(prev => prev.filter(o => o.id !== id));

  const filtered = orders.filter(o => {
    const matchS = o.item?.toLowerCase().includes(searchTerm.toLowerCase()) || o.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchF = statusFilter === 'ALL' || o.status === statusFilter;
    return matchS && matchF;
  });

  const stats = {
    total: orders.length,
    draft: orders.filter(o => o.status === 'DRAFT').length,
    pending: orders.filter(o => o.status === 'SENT' || o.status === 'APPROVED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    totalValue: orders.reduce((s, o) => s + (Number(o.amount) || 0), 0),
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-400">Loading procurement engine...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-500" /> Procurement Engine
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Raise, track, and approve purchase orders — from vendor selection to delivery.</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 cursor-pointer transition-all">
          <Plus className="w-3.5 h-3.5" /> Raise Purchase Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total POs', value: stats.total, color: 'text-blue-500' },
          { label: 'Draft', value: stats.draft, color: 'text-slate-400' },
          { label: 'In Progress', value: stats.pending, color: 'text-amber-500' },
          { label: 'Delivered', value: stats.delivered, color: 'text-emerald-500' },
          { label: 'Total Value', value: `₹${(stats.totalValue / 100000).toFixed(1)}L`, color: 'text-purple-500' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-center">
            <div className={`text-xl font-extrabold font-display ${s.color}`}>{s.value}</div>
            <div className="text-[9px] text-slate-400 font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search PO by item, vendor..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-colors" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none cursor-pointer">
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="APPROVED">Approved</option>
          <option value="DELIVERED">Delivered</option>
        </select>
      </div>

      {/* PO Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Package className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-semibold">No purchase orders found.</p>
            <button onClick={handleOpenAdd} className="mt-2 text-xs text-blue-500 font-bold underline cursor-pointer">Raise your first PO</button>
          </div>
        ) : filtered.map(order => (
          <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-all">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-[10px] text-brand-500 font-extrabold">{order.id}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${STATUS_STYLES[order.status] || ''}`}>{order.status}</span>
                <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded font-bold uppercase">{order.category}</span>
              </div>
              <div className="font-extrabold text-sm truncate">{order.item}</div>
              <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 font-medium mt-1.5">
                <span>Vendor: <span className="text-slate-600 dark:text-slate-300 font-bold">{order.vendor}</span></span>
                <span>Raised: {order.raised}</span>
                <span>Expected: {order.expected}</span>
              </div>
              {order.remarks && <div className="text-[9px] text-slate-400 mt-1 italic">"{order.remarks}"</div>}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="font-extrabold text-sm">{fmt(Number(order.amount))}</div>
                <div className="text-[9px] text-slate-400">Order value</div>
              </div>
              <div className="flex flex-col gap-1">
                {order.status === 'DRAFT' && (
                  <button onClick={() => handleStatusChange(order.id, 'SENT')} className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1"><Send className="w-3 h-3" />Send</button>
                )}
                {order.status === 'SENT' && (activeRole === 'OWNER' || activeRole === 'PROJECT_MANAGER') && (
                  <button onClick={() => handleStatusChange(order.id, 'APPROVED')} className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1"><CheckCircle className="w-3 h-3" />Approve</button>
                )}
                {order.status === 'APPROVED' && (
                  <button onClick={() => handleStatusChange(order.id, 'DELIVERED')} className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1"><CheckCircle className="w-3 h-3" />Delivered</button>
                )}
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEdit(order)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-500 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(order.id)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-display font-bold text-sm">{editMode ? 'Edit Purchase Order' : 'Raise Purchase Order'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Vendor *</label>
                  <select required value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none cursor-pointer">
                    {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none cursor-pointer">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Item Description *</label>
                  <input required value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-blue-500" placeholder="e.g. 500 bags OPC cement 53 grade" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Order Value (₹) *</label>
                  <input required type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-blue-500" placeholder="190000" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Expected Delivery</label>
                  <input type="date" value={form.expected} onChange={e => setForm(f => ({ ...f, expected: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Remarks / Notes</label>
                  <textarea rows={2} value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-blue-500 resize-none" placeholder="Add any special instructions..." />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer">
                  {editMode ? 'Update PO' : 'Raise PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
