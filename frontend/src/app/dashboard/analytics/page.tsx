'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../DashboardContext';
import { api } from '@/utils/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, RadialBarChart, RadialBar, PieChart, Pie, LineChart, Line,
  CartesianGrid, Legend
} from 'recharts';
import { BarChart2, Sparkles, TrendingUp, Users, AlertTriangle, CheckCircle, Target, Cpu, Zap } from 'lucide-react';

const PHASE_COLORS = ['#10b981', '#3b82f6', '#06b6d4', '#f59e0b', '#8b5cf6', '#ef4444'];

const milestoneData = [
  { name: 'Foundation', progress: 100, fill: '#10b981' },
  { name: 'Framing', progress: 88, fill: '#3b82f6' },
  { name: 'Electrical', progress: 52, fill: '#06b6d4' },
  { name: 'Plumbing', progress: 38, fill: '#f59e0b' },
  { name: 'Finishing', progress: 20, fill: '#8b5cf6' },
  { name: 'QA/Handover', progress: 5, fill: '#94a3b8' },
];

const weeklyProgress = [
  { week: 'Wk 1', Tasks: 8, Completed: 7 },
  { week: 'Wk 2', Tasks: 12, Completed: 11 },
  { week: 'Wk 3', Tasks: 15, Completed: 10 },
  { week: 'Wk 4', Tasks: 10, Completed: 9 },
  { week: 'Wk 5', Tasks: 18, Completed: 14 },
  { week: 'Wk 6', Tasks: 14, Completed: 13 },
];

const departmentEfficiency = [
  { dept: 'Engineering', efficiency: 92 },
  { dept: 'Procurement', efficiency: 78 },
  { dept: 'Operations', efficiency: 85 },
  { dept: 'Safety', efficiency: 96 },
  { dept: 'HR', efficiency: 72 },
];

const AI_INSIGHTS = [
  {
    type: 'WARNING',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/25',
    title: 'Task Delay Risk Detected',
    body: 'First floor slab casting is at HIGH RISK of a 5-day delay due to lagging steel reinforcement rebar works. Recommend reallocating 2 helper workers to rebar assembly immediately.',
  },
  {
    type: 'SAVING',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/25',
    title: 'Cost Savings Opportunity',
    body: 'Bulk procuring AAC block supplies from local vendors will yield a 12% cost variance savings (est. ₹3.2L) against original BOQ planning estimates.',
  },
  {
    type: 'RESOURCE',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/25',
    title: 'Labour Utilization Gap',
    body: 'Electrical team is at 52% utilization this week — consider reallocating 2 electricians to the interior conduit works in blocks C & D to maximize crew efficiency.',
  },
  {
    type: 'QUALITY',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10 border-purple-500/25',
    title: 'Quality Check Upcoming',
    body: '3rd Floor Slab thickness QA inspection is due in 2 days. Ensure NDT equipment is on-site and the structural consultant approval report is ready.',
  },
];

export default function AnalyticsPage() {
  const { activeProjectId } = useDashboard();
  const [metrics, setMetrics] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [metricsRes, empRes] = await Promise.all([
      api.get<any>('/dashboard/metrics'),
      api.get<any[]>('/employees'),
    ]);
    if (metricsRes.data) setMetrics(metricsRes.data);
    if (empRes.data && Array.isArray(empRes.data)) setEmployees(empRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData, activeProjectId]);

  const totalTasks = metrics?.metrics?.totalTasks || 24;
  const completedTasks = metrics?.metrics?.completedTasks || 18;
  const inProgressTasks = metrics?.metrics?.inProgressTasks || 4;
  const completionPct = Math.round((completedTasks / totalTasks) * 100);
  const activeEmployees = employees.filter(e => e.status === 'ACTIVE').length || 12;
  const safetyDays = 87;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-400">Loading analytics engine...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-purple-500" /> Business Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Construction KPIs, productivity audits, AI insights, and phase completion metrics.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/25 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400">
          <Cpu className="w-3.5 h-3.5 animate-pulse" /> AI Insights Active
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Project Completion', value: `${completionPct}%`, sub: `${completedTasks}/${totalTasks} tasks done`, color: 'text-purple-500', trend: '+8%' },
          { label: 'Active Workforce', value: activeEmployees, sub: 'Employees on payroll', color: 'text-blue-500', trend: null },
          { label: 'Safety Free Days', value: safetyDays, sub: 'LTI-free streak', color: 'text-emerald-500', trend: '+12 days' },
          { label: 'Tasks In Progress', value: inProgressTasks, sub: 'Pending completion', color: 'text-amber-500', trend: null },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div className={`text-2xl font-extrabold font-display ${kpi.color}`}>{kpi.value}</div>
              {kpi.trend && <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />{kpi.trend}</span>}
            </div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">{kpi.label}</div>
            <div className="text-[9px] text-slate-400 mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phase Progress Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-1">Phase-wise Milestone Progress (%)</h3>
          <p className="text-[10px] text-slate-400 mb-4">Construction phase completion status against project baseline schedule.</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={milestoneData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} formatter={(v: any) => [`${v}%`, 'Progress']} />
                <Bar dataKey="progress" radius={[0, 8, 8, 0]} barSize={20}>
                  {milestoneData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">AI Resource Optimizer</h3>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {AI_INSIGHTS.map((insight, i) => (
              <div key={i} className={`p-3 rounded-xl border ${insight.bg} text-xs`}>
                <div className={`font-extrabold mb-1 ${insight.color} flex items-center gap-1.5`}>
                  {insight.type === 'WARNING' ? <AlertTriangle className="w-3 h-3" /> : insight.type === 'SAVING' ? <Zap className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                  {insight.title}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{insight.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly progress + Department efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Task Completion */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-1">Weekly Task Throughput</h3>
          <p className="text-[10px] text-slate-400 mb-4">Tasks assigned vs. completed each week.</p>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="Tasks" name="Assigned" radius={[6, 6, 0, 0]} fill="#e2e8f0" barSize={18} />
                <Bar dataKey="Completed" name="Completed" radius={[6, 6, 0, 0]} fill="#8b5cf6" barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Efficiency */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">Department Efficiency Scores</h3>
          <div className="space-y-4">
            {departmentEfficiency.map(dep => {
              const color = dep.efficiency >= 90 ? '#10b981' : dep.efficiency >= 80 ? '#3b82f6' : dep.efficiency >= 70 ? '#f59e0b' : '#ef4444';
              return (
                <div key={dep.dept} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-300">{dep.dept}</span>
                    <span style={{ color }}>{dep.efficiency}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${dep.efficiency}%`, background: color }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-3.5 h-3.5 text-purple-500" />
              <span className="font-extrabold text-slate-600 dark:text-slate-300">Overall Productivity Score</span>
            </div>
            <div className="text-2xl font-extrabold text-purple-500 font-display">
              {Math.round(departmentEfficiency.reduce((s, d) => s + d.efficiency, 0) / departmentEfficiency.length)}%
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">Avg. across all departments</div>
          </div>
        </div>
      </div>

      {/* Safety metrics */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">HSE Safety Dashboard</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Health, Safety & Environment metrics — zero tolerance policy</p>
          </div>
          <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold rounded-xl">
            🏆 {safetyDays} Days LTI-Free
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Incidents This Month', value: '0', color: 'text-emerald-500' },
            { label: 'Near Misses Reported', value: '3', color: 'text-amber-500' },
            { label: 'PPE Compliance', value: '97%', color: 'text-blue-500' },
            { label: 'Safety Audits Done', value: '12', color: 'text-purple-500' },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-3">
              <div className={`text-2xl font-extrabold font-display ${s.color}`}>{s.value}</div>
              <div className="text-[9px] text-slate-400 font-semibold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
