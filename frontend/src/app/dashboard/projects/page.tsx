'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDashboard } from '../DashboardContext';
import { api } from '@/utils/api';
import {
  Folder,
  Plus,
  Search,
  Calendar,
  Layers,
  Coins,
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProjectsList() {
  const { refreshTrigger, triggerRefresh, activeRole } = useDashboard();
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PLANNING' | 'DELAYED'>('ALL');

  // Create Project Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-06-20');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [budget, setBudget] = useState(50000000); // Default ₹5 Cr
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const res = await api.get<any[]>('/projects');
      if (res.data) {
        setProjectsList(res.data);
      } else {
        // Mock fallback if API offline
        setProjectsList([
          { id: 'project-1', name: 'Luxury Villa - Sector 54', description: 'Construction of a premium 5-bedroom luxury villa.', startDate: '2026-01-01', endDate: '2026-12-31', budget: 50000000, status: 'ACTIVE' },
          { id: 'project-2', name: 'Greenwood Commercial Complex', description: 'Eco-friendly 4-storey shopping outlet complex.', startDate: '2026-03-15', endDate: '2027-06-30', budget: 150000000, status: 'PLANNING' },
          { id: 'project-3', name: 'Skyline Heights - Tower A', description: 'High-rise residential housing block.', startDate: '2025-06-01', endDate: '2026-05-30', budget: 250000000, status: 'DELAYED' }
        ]);
      }
      setLoading(false);
    };
    fetchProjects();
  }, [refreshTrigger]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const res = await api.post('/projects', {
      name,
      description,
      startDate,
      endDate,
      budget: Number(budget),
    });

    setSubmitting(false);
    if (res.data) {
      // Trigger celebrate
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      setName('');
      setDescription('');
      setModalOpen(false);
      triggerRefresh();
    } else {
      // Offline simulation fallback: add local state
      const newMock = {
        id: `project-${Date.now()}`,
        name,
        description,
        startDate,
        endDate,
        budget: Number(budget),
        status: 'PLANNING',
      };
      setProjectsList(prev => [newMock, ...prev]);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setName('');
      setDescription('');
      setModalOpen(false);
    }
  };

  // Filters projects based on criteria
  const filteredProjects = projectsList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && p.status === statusFilter;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue';
      case 'DELAYED':
        return 'bg-accent-rose/10 border-accent-rose/30 text-accent-rose';
      case 'COMPLETED':
        return 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">Tenant Workspaces</h1>
          <p className="text-sm text-slate-400">Launch and administer individual construction sites.</p>
        </div>
        
        {/* Only OWNER/PM can create projects */}
        {activeRole !== 'CLIENT' && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 font-bold text-white rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all text-xs"
          >
            <Plus className="w-4 h-4" /> New Construction Project
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project name or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-850">
          {(['ALL', 'ACTIVE', 'PLANNING', 'DELAYED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${
                statusFilter === f
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Projects list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 shimmer rounded-2xl"></div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/40">
          <Folder className="w-12 h-12 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No Projects Found</h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto mt-1">Try adapting your filters or create a new project workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(proj => (
            <div
              key={proj.id}
              className="glass-panel glass-panel-hover bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden shadow-sm"
            >
              {/* Card Top */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase border rounded-full tracking-wider ${getStatusBadge(proj.status)}`}>
                    {proj.status}
                  </span>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> ID: {proj.id.split('-')[1] || proj.id}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold line-clamp-1">{proj.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[36px]">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Coins className="w-3 h-3 text-slate-400" /> Budget
                    </span>
                    <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">{formatCurrency(proj.budget)}</div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> Start Date
                    </span>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {new Date(proj.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <Link
                href={`/dashboard/projects/${proj.id}`}
                className="py-3.5 px-6 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold group hover:bg-brand-500 hover:text-white transition-all text-slate-600 dark:text-slate-350"
              >
                Enter Execution Panel
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-500" />
                <h3 className="font-display font-bold text-lg text-slate-950 dark:text-white">Launch New Workspace</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateProject}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luxury Villa - Sector 54"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about the project location, milestones, goals..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Expected End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Budget Allocated (₹/INR)</label>
                  <input
                    type="number"
                    required
                    value={budget}
                    onChange={e => setBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-xs font-bold text-white rounded-lg shadow-lg shadow-brand-500/10 transition-all"
                >
                  {submitting ? 'Creating...' : 'Initialize Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
