'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../DashboardContext';
import { api } from '@/utils/api';
import { Briefcase, Plus, Search, Star, Pencil, Trash2, Eye, X, Phone, Mail, MapPin, Building2 } from 'lucide-react';

const CATEGORIES = ['Cement & Concrete', 'Reinforced Rebars', 'Sanitary fittings', 'Paints & Coatings', 'Electrical Materials', 'Plumbing Materials', 'Tile & Flooring', 'Safety Equipment', 'Timber & Formwork', 'Machinery Rental'];

const EMPTY_FORM = { name: '', contact: '', phone: '', email: '', category: '', city: '', gstNumber: '', score: 4.5, status: 'ACTIVE' };

export default function VendorsPage() {
  const { activeProjectId } = useDashboard();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    const res = await api.get<any[]>('/vendors');
    if (res.data && Array.isArray(res.data)) {
      setVendors(res.data);
    } else {
      setVendors([
        { id: 'v-1', name: 'UltraTech Cement Supplier', contact: 'Manoj Bajpayee', phone: '9876543001', email: 'manoj@ultratech.com', category: 'Cement & Concrete', score: 4.8, status: 'ACTIVE', city: 'Mumbai' },
        { id: 'v-2', name: 'Tata Tiscon Steel distributor', contact: 'Vijay Raaz', phone: '9876543002', email: 'vijay@tatatiscon.com', category: 'Reinforced Rebars', score: 4.9, status: 'ACTIVE', city: 'Pune' },
        { id: 'v-3', name: 'Hindware Bathrooms & Sanitary', contact: 'Kirti Kulhari', phone: '9876543003', email: 'kirti@hindware.com', category: 'Sanitary fittings', score: 4.2, status: 'ACTIVE', city: 'Delhi' },
      ]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors, activeProjectId]);

  const handleOpenAdd = () => { setForm({ ...EMPTY_FORM }); setEditMode(false); setSelected(null); setModalOpen(true); };
  const handleOpenEdit = (v: any) => { setForm({ name: v.name || '', contact: v.contact || '', phone: v.phone || '', email: v.email || '', category: v.category || '', city: v.city || '', gstNumber: v.gstNumber || '', score: v.score || 4.5, status: v.status || 'ACTIVE' }); setSelected(v); setEditMode(true); setModalOpen(true); };
  const handleOpenView = (v: any) => { setSelected(v); setViewModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editMode && selected) {
      await api.put(`/vendors/${selected.id}`, form);
    } else {
      await api.post('/vendors', form);
    }
    await fetchVendors();
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/vendors/${id}`);
    setDeleteConfirm(null);
    await fetchVendors();
  };

  const filtered = vendors.filter(v => {
    const matchSearch = v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || v.category?.toLowerCase().includes(searchTerm.toLowerCase()) || v.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = catFilter === 'ALL' || v.category === catFilter;
    return matchSearch && matchCat;
  });

  const StarRating = ({ score }: { score: number }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3 h-3 ${s <= Math.round(score) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-700'}`} />
      ))}
      <span className="text-[10px] text-slate-400 font-bold ml-1">{score}</span>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-400">Loading vendor directory...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-cyan-500" /> Vendor Directory
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage supply chain partners, contacts, and performance ratings.</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 cursor-pointer transition-all">
          <Plus className="w-3.5 h-3.5" /> Add Vendor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Vendors', value: vendors.length, color: 'text-cyan-500' },
          { label: 'Active', value: vendors.filter(v => v.status === 'ACTIVE').length, color: 'text-emerald-500' },
          { label: 'Avg Rating', value: vendors.length ? (vendors.reduce((s, v) => s + (v.score || 0), 0) / vendors.length).toFixed(1) : '—', color: 'text-yellow-500' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
            <div className={`text-2xl font-extrabold font-display ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search vendor name, category, city..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500 transition-colors" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none cursor-pointer">
          <option value="ALL">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-3 py-20 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-semibold">No vendors found.</p>
            <button onClick={handleOpenAdd} className="mt-3 text-xs text-cyan-500 font-bold underline cursor-pointer">Add your first vendor</button>
          </div>
        ) : filtered.map(vendor => (
          <div key={vendor.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md hover:border-cyan-500/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-extrabold text-sm">
                  {vendor.name?.[0] || 'V'}
                </div>
                <div>
                  <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {vendor.category}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenView(vendor)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 text-slate-400 hover:text-cyan-500 cursor-pointer"><Eye className="w-3 h-3" /></button>
                <button onClick={() => handleOpenEdit(vendor)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 text-slate-400 hover:text-amber-500 cursor-pointer"><Pencil className="w-3 h-3" /></button>
                <button onClick={() => setDeleteConfirm(vendor.id)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
            <h3 className="font-extrabold text-sm mb-1 leading-snug">{vendor.name}</h3>
            <StarRating score={vendor.score || 0} />
            <div className="mt-3 space-y-1.5 text-[10px] font-semibold text-slate-400">
              <div className="flex items-center gap-1.5"><Building2 className="w-3 h-3 shrink-0" />{vendor.contact}</div>
              <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0" />+91 {vendor.phone}</div>
              {vendor.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 shrink-0" />{vendor.email}</div>}
              {vendor.city && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 shrink-0" />{vendor.city}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-display font-bold text-sm">{editMode ? 'Edit Vendor' : 'Add New Vendor'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Vendor / Company Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500" placeholder="e.g. UltraTech Cement" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Contact Person</label>
                  <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500" placeholder="Contact name" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category *</label>
                  <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none cursor-pointer">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500" placeholder="9876543001" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500" placeholder="vendor@company.com" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">City</label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">GST Number</label>
                  <input value={form.gstNumber} onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500" placeholder="27AABCU5603R1ZP" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Rating (0-5)</label>
                  <input type="number" min="0" max="5" step="0.1" value={form.score} onChange={e => setForm(f => ({ ...f, score: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer">
                  {saving ? 'Saving...' : editMode ? 'Update Vendor' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModalOpen && selected && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-display font-bold text-sm">Vendor Details</h2>
              <button onClick={() => setViewModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-extrabold text-lg">{selected.name?.[0]}</div>
                <div>
                  <div className="font-bold">{selected.name}</div>
                  <div className="flex gap-0.5 mt-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= Math.round(selected.score) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Category', value: selected.category },
                  { label: 'City', value: selected.city || '—' },
                  { label: 'Contact', value: selected.contact || '—' },
                  { label: 'Phone', value: selected.phone ? `+91 ${selected.phone}` : '—' },
                  { label: 'Email', value: selected.email || '—' },
                  { label: 'GST No.', value: selected.gstNumber || '—' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">{item.label}</div>
                    <div className="font-bold text-slate-800 dark:text-white truncate">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-bold text-center mb-2">Remove Vendor?</h3>
            <p className="text-xs text-slate-400 text-center mb-5">The vendor record will be permanently deleted.</p>
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
