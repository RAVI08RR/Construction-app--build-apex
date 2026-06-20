'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '../DashboardContext';
import { api } from '@/utils/api';
import { Calendar as CalendarIcon, ClipboardCheck, Clock } from 'lucide-react';

export default function SchedulesPage() {
  const { activeProjectId } = useDashboard();
  const [upcomingMilestones, setUpcomingMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await api.get<any>('/dashboard/metrics');
      if (res.data) {
        setUpcomingMilestones(res.data.upcomingMilestones || []);
      } else {
        setUpcomingMilestones([
          { id: 'ms-2', name: 'Superstructure Framework', dueDate: '2026-06-30', progress: 75, projectName: 'Luxury Villa - Sector 54' },
          { id: 'ms-3', name: 'Brickwork & Plastering', dueDate: '2026-09-15', progress: 30, projectName: 'Luxury Villa - Sector 54' }
        ]);
      }
      setLoading(false);
    };
    fetchData();
  }, [activeProjectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-400">Loading schedules & calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-extrabold tracking-tight">Tasks Schedule</h1>
        <p className="text-sm text-slate-400">Interactive Gantt timeline, upcoming inspection calendar, and milestones.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gantt Timeline */}
        <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-1">Gantt Milestone Schedule</h3>
            <p className="text-xs text-slate-400">Visual mapping of phase start and duration schedules.</p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { name: 'Excavation & Foundations', range: 'Jan - Feb', start: 0, width: 30, color: 'bg-accent-emerald' },
              { name: 'RCC Superstructure Pillar Casting', range: 'Mar - Jun', start: 30, width: 50, color: 'bg-accent-blue' },
              { name: 'Brickwork Partitioning Layouts', range: 'Jun - Sep', start: 60, width: 30, color: 'bg-accent-cyan' },
            ].map(bar => (
              <div key={bar.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>{bar.name}</span>
                  <span className="text-slate-400">{bar.range}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg h-5 relative">
                  <div
                    className={`h-full rounded-lg absolute ${bar.color}`}
                    style={{ left: `${bar.start}%`, width: `${bar.width}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">Inspection Calendar</h3>
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 mb-2 border-b dark:border-slate-800 pb-2">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {[...Array(30)].map((_, i) => {
                const day = i + 1;
                const hasEvent = day === 22 || day === 25;
                return (
                  <div
                    key={i}
                    className={`py-2 rounded-lg relative flex flex-col items-center justify-center font-bold ${
                      hasEvent
                        ? 'bg-brand-500/10 border border-brand-500/30 text-brand-500'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {day}
                    {hasEvent && <span className="h-1.5 w-1.5 rounded-full bg-brand-500 absolute bottom-1"></span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Upcoming Project Milestones</h3>
          <p className="text-xs text-slate-400">Target delivery schedules and execution completion status.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {upcomingMilestones.map(ms => (
            <div key={ms.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-xl space-y-3 font-bold text-xs">
              <div className="flex justify-between items-start gap-3">
                <span className="truncate">{ms.name}</span>
                <span className="text-[10px] bg-brand-500/15 border border-brand-500/20 text-brand-500 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">{ms.progress}%</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-t dark:border-slate-850 pt-2 font-semibold">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due {new Date(ms.dueDate).toLocaleDateString()}</span>
                <span className="truncate max-w-[120px]">{ms.projectName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
