'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../DashboardContext';
import { api } from '@/utils/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle,
  FileText, Clock, ArrowUpRight, ArrowDownRight, Sparkles, Target
} from 'lucide-react';

const fmt = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
const fmtCr = (v: number) => `₹${(v / 10000000).toFixed(2)} Cr`;

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const cashFlowData = [
  { month: 'Jan', Budget: 8.0, Spent: 3.2, Received: 5.5 },
  { month: 'Feb', Budget: 12.0, Spent: 7.5, Received: 9.0 },
  { month: 'Mar', Budget: 18.0, Spent: 11.2, Received: 13.5 },
  { month: 'Apr', Budget: 28.0, Spent: 16.8, Received: 20.0 },
  { month: 'May', Budget: 38.0, Spent: 20.5, Received: 26.5 },
  { month: 'Jun', Budget: 50.0, Spent: 22.5, Received: 35.0 },
];

const expenseCategories = [
  { name: 'Materials', value: 45, color: '#3b82f6' },
  { name: 'Labour', value: 25, color: '#10b981' },
  { name: 'Equipment', value: 15, color: '#f59e0b' },
  { name: 'Overheads', value: 10, color: '#8b5cf6' },
  { name: 'Misc', value: 5, color: '#94a3b8' },
];

const invoices = [
  { id: 'INV-2026-001', client: 'Luxury Villa Owner', amount: 15000000, due: '2026-06-30', status: 'PENDING', type: 'MILESTONE' },
  { id: 'INV-2026-002', client: 'Greenwood Corp', amount: 8500000, due: '2026-07-15', status: 'PAID', type: 'PROGRESS' },
  { id: 'INV-2026-003', client: 'Skyline Heights Ltd', amount: 22000000, due: '2026-06-10', status: 'OVERDUE', type: 'MILESTONE' },
  { id: 'INV-2026-004', client: 'Luxury Villa Owner', amount: 5000000, due: '2026-08-01', status: 'DRAFT', type: 'RETENTION' },
];

const STATUS_INV: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-600 border border-amber-500/25',
  PAID: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25',
  OVERDUE: 'bg-red-500/10 text-red-500 border border-red-500/25',
  DRAFT: 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700',
};

export default function FinancePage() {
  const { activeProjectId } = useDashboard();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'expenses'>('overview');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await api.get<any>('/dashboard/metrics');
    if (res.data) setMetrics(res.data.metrics);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData, activeProjectId]);

  const totalBudget = metrics?.totalBudget || 450000000;
  const budgetUsed = metrics?.budgetUsed || 225000000;
  const pendingPayments = metrics?.pendingPayments || 110000000;
  const forecastCost = metrics?.forecastCost || 480000000;
  const revenue = metrics?.revenue || 120000000;
  const riskScore = metrics?.riskScore || 68;
  const utilPct = Math.round((budgetUsed / totalBudget) * 100);

  const pendingInvoices = invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE');
  const overdueTotal = invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.amount, 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-400">Loading financial statements...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-500" /> Finance Statements
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Budget tracking, cash flow forecasting, invoice management, and cost variance analysis.</p>
        </div>
        <div className="flex gap-2 text-xs font-bold">
          {(['overview', 'invoices', 'expenses'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl capitalize cursor-pointer transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Overdue Alert */}
      {overdueTotal > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-bold text-red-600 dark:text-red-400">Overdue Invoices — Immediate Action Required</div>
            <div className="text-[10px] text-red-500/80">{fmt(overdueTotal)} in outstanding invoices are past due. Contact clients immediately.</div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Project Budget', value: fmtCr(totalBudget), sub: 'Across all projects', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Target, trend: null },
          { label: 'Budget Consumed', value: fmtCr(budgetUsed), sub: `${utilPct}% utilized`, color: 'text-amber-500', bg: 'bg-amber-500/10', icon: TrendingUp, trend: `+${utilPct}%` },
          { label: 'Pending Payments', value: fmtCr(pendingPayments), sub: 'Outstanding dues', color: 'text-red-500', bg: 'bg-red-500/10', icon: Clock, trend: null },
          { label: 'Total Revenue', value: fmtCr(revenue), sub: 'Billed to clients', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: DollarSign, trend: '+12%' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              {kpi.trend && (
                <span className="text-[9px] font-bold flex items-center gap-0.5 text-emerald-500">
                  <ArrowUpRight className="w-3 h-3" />{kpi.trend}
                </span>
              )}
            </div>
            <div className={`text-lg font-extrabold font-display ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{kpi.label}</div>
            <div className="text-[9px] text-slate-400 mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Budget Progress Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Overall Budget Utilization</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Forecast cost vs. planned budget</p>
          </div>
          <div className="text-right">
            <div className={`text-sm font-extrabold ${utilPct > 80 ? 'text-red-500' : utilPct > 60 ? 'text-amber-500' : 'text-emerald-500'}`}>{utilPct}%</div>
            <div className="text-[9px] text-slate-400">of budget used</div>
          </div>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-3 overflow-hidden">
          <div className={`h-3 rounded-full transition-all ${utilPct > 80 ? 'bg-red-500' : utilPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${utilPct}%` }}></div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-2">
          <span>₹0</span>
          <span>Forecast: {fmtCr(forecastCost)}</span>
          <span>Budget: {fmtCr(totalBudget)}</span>
        </div>
        {/* Risk Score */}
        <div className="mt-4 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
          <div className={`text-2xl font-extrabold font-display ${riskScore > 70 ? 'text-red-500' : riskScore > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>{riskScore}/100</div>
          <div>
            <div className="text-xs font-bold">Financial Risk Score</div>
            <div className="text-[10px] text-slate-400 font-medium">{riskScore > 70 ? '⚠ High risk — cost overrun likely' : riskScore > 50 ? '⚡ Medium risk — monitor closely' : '✓ Low risk — on track'}</div>
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cash Flow Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-1">Cash Flow Forecast (₹ Crore)</h3>
            <p className="text-[10px] text-slate-400 mb-5">Budget planned vs. actual spent vs. client receipts month-over-month.</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <defs>
                    <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="Budget" name="Budget (Cr)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBudget)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="Spent" name="Spent (Cr)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorSpent)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="Received" name="Received (Cr)" stroke="#10b981" fillOpacity={1} fill="url(#colorRec)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense Pie */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">Cost Breakdown</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseCategories} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {expenseCategories.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {expenseCategories.map(cat => (
                <div key={cat.name} className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }}></div><span className="text-slate-600 dark:text-slate-300">{cat.name}</span></div>
                  <span className="text-slate-400">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Invoice Ledger ({invoices.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[10px] text-brand-500 font-bold">{inv.id}</td>
                    <td className="py-3.5 px-4 font-bold">{inv.client}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">{inv.type}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold">{fmt(inv.amount)}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{new Date(inv.due).toLocaleDateString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${STATUS_INV[inv.status]}`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-extrabold text-xs">
                  <td colSpan={3} className="py-3 px-4 text-slate-500">Total Outstanding</td>
                  <td className="py-3 px-4 text-right text-red-500">{fmt(invoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + i.amount, 0))}</td>
                  <td colSpan={2} className="py-3 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">Monthly Expense Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="Spent" name="Spent (Cr)" radius={[6, 6, 0, 0]} fill="#f59e0b" barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Cost Category Analysis</h3>
            {expenseCategories.map(cat => {
              const amt = (budgetUsed * cat.value) / 100;
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-300">{cat.name}</span>
                    <span style={{ color: cat.color }}>{fmtCr(amt)} ({cat.value}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full" style={{ width: `${cat.value}%`, background: cat.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
