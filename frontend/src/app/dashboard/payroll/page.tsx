'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../DashboardContext';
import { api } from '@/utils/api';
import { Coins, Plus, CheckCircle, Clock, TrendingUp, FileText, Download, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const fmt = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

export default function PayrollPage() {
  const { activeProjectId, activeRole } = useDashboard();
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  const [runMonth, setRunMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [running, setRunning] = useState(false);
  const [approving, setApproving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [prRes, empRes, metricsRes] = await Promise.all([
      api.get<any[]>('/hrms/payroll'),
      api.get<any[]>('/employees'),
      api.get<any>('/dashboard/metrics'),
    ]);
    
    if (prRes.data && Array.isArray(prRes.data)) {
      setPayrollRuns(prRes.data);
    } else if (metricsRes.data?.payrollRun) {
      setPayrollRuns([{ ...metricsRes.data.payrollRun, payslips: metricsRes.data.payrollRun.payslips || [] }]);
    }
    
    if (empRes.data && Array.isArray(empRes.data)) {
      setEmployees(empRes.data);
    } else {
      setEmployees(metricsRes.data?.employees || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData, activeProjectId]);

  const handleRunPayroll = async () => {
    setRunning(true);
    await api.post('/hrms/payroll/run', { month: runMonth });
    await fetchData();
    setRunning(false);
    setRunModalOpen(false);
  };

  const handleApprove = async (run: any) => {
    setApproving(true);
    await api.post(`/hrms/payroll/${run.id}/approve`, {});
    confetti({ particleCount: 80, spread: 60 });
    await fetchData();
    setApproving(false);
  };

  const handleViewPayslips = async (run: any) => {
    setSelectedRun(run);
    const res = await api.get<any[]>(`/hrms/payslips/${run.id}`);
    if (res.data && Array.isArray(res.data)) {
      setPayslips(res.data);
    } else {
      setPayslips(run.payslips || []);
    }
    setPayslipModalOpen(true);
  };

  const latestRun = payrollRuns[0];
  const totalPayroll = employees.reduce((s, e) => s + (Number(e.salaryBasic) || 0) + (Number(e.allowanceHRA) || 0) + (Number(e.allowanceMisc) || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-400">Loading payroll data...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-500" /> Payroll & Salaries
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Run monthly payroll cycles, compute PF/ESIC deductions, and approve bank transfers.</p>
        </div>
        {(activeRole === 'OWNER' || activeRole === 'PROJECT_MANAGER') && (
          <button onClick={() => setRunModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-yellow-500/20 cursor-pointer transition-all">
            <Plus className="w-3.5 h-3.5" /> Run Payroll Cycle
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Estimated Monthly Payroll</div>
          <div className="text-3xl font-extrabold font-display text-yellow-500">{fmt(totalPayroll)}</div>
          <div className="text-[10px] text-slate-400 mt-1">{employees.length} active employees</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Last Run Status</div>
          {latestRun ? (
            <>
              <div className="text-xl font-extrabold font-display mb-1">{latestRun.month}</div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${latestRun.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25' : 'bg-amber-500/10 text-amber-500 border border-amber-500/25'}`}>{latestRun.status}</span>
                <span className="text-xs text-slate-400 font-semibold">{fmt(latestRun.totalPayroll)}</span>
              </div>
            </>
          ) : (
            <div className="text-sm text-slate-400 font-semibold">No runs yet</div>
          )}
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Total Payroll Runs</div>
          <div className="text-3xl font-extrabold font-display text-brand-500">{payrollRuns.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">{payrollRuns.filter(r => r.status === 'APPROVED').length} approved</div>
        </div>
      </div>

      {/* Payroll Runs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Payroll Run History</h3>
        </div>
        {payrollRuns.length === 0 ? (
          <div className="py-20 text-center">
            <Coins className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-semibold">No payroll runs yet.</p>
            <button onClick={() => setRunModalOpen(true)} className="mt-3 text-xs text-yellow-500 font-bold underline cursor-pointer">Trigger your first payroll cycle</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {payrollRuns.map(run => {
              const pct = run.totalPayroll > 0 ? Math.round((run.distributedAmt / run.totalPayroll) * 100) : 0;
              return (
                <div key={run.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${run.status === 'APPROVED' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                      {run.status === 'APPROVED' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5 text-amber-500" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm">Payroll — {run.month}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">Total: {fmt(run.totalPayroll)} • Distributed: {fmt(run.distributedAmt || 0)}</div>
                      <div className="w-40 mt-1.5">
                        <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1 overflow-hidden">
                          <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="text-[9px] text-slate-400">{pct}% disbursed</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleViewPayslips(run)} className="px-3 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Payslips
                    </button>
                    {run.status !== 'APPROVED' && activeRole === 'OWNER' && (
                      <button onClick={() => handleApprove(run)} disabled={approving} className="px-3 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-lg shadow cursor-pointer flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Approve & Disburse
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Employee Salary Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Employee Salary Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Basic</th>
                <th className="py-3 px-4 text-right">HRA</th>
                <th className="py-3 px-4 text-right">PF (12%)</th>
                <th className="py-3 px-4 text-right">Net CTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map(emp => {
                const basic = Number(emp.salaryBasic) || 0;
                const hra = Number(emp.allowanceHRA) || 0;
                const misc = Number(emp.allowanceMisc) || 0;
                const pf = Math.round(basic * 0.12);
                const net = basic + hra + misc - pf;
                return (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold text-[10px]">{emp.name?.[0]}</div>
                        <span className="font-bold">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-medium">{emp.department}</td>
                    <td className="py-3 px-4 text-right font-bold">{fmt(basic)}</td>
                    <td className="py-3 px-4 text-right text-slate-400 font-medium">{fmt(hra)}</td>
                    <td className="py-3 px-4 text-right text-red-500 font-bold">-{fmt(pf)}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{fmt(net)}</td>
                  </tr>
                );
              })}
              {employees.length > 0 && (
                <tr className="bg-slate-50 dark:bg-slate-800/50 font-extrabold border-t-2 border-slate-200 dark:border-slate-700">
                  <td colSpan={2} className="py-3 px-4 text-slate-500 dark:text-slate-400">Total Payroll</td>
                  <td className="py-3 px-4 text-right">{fmt(employees.reduce((s, e) => s + (Number(e.salaryBasic) || 0), 0))}</td>
                  <td className="py-3 px-4 text-right">{fmt(employees.reduce((s, e) => s + (Number(e.allowanceHRA) || 0), 0))}</td>
                  <td className="py-3 px-4 text-right text-red-500">-{fmt(employees.reduce((s, e) => s + Math.round(Number(e.salaryBasic) * 0.12), 0))}</td>
                  <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400">{fmt(totalPayroll - employees.reduce((s, e) => s + Math.round(Number(e.salaryBasic) * 0.12), 0))}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Run Payroll Modal */}
      {runModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-sm">Trigger Payroll Run</h2>
              <button onClick={() => setRunModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Payroll Month</label>
                <input type="month" value={runMonth} onChange={e => setRunMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-yellow-500" />
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/25 rounded-xl text-xs text-yellow-700 dark:text-yellow-400 font-semibold">
                ⚡ This will auto-compute basic + HRA + allowances for all {employees.length} active employees and generate individual payslips.
              </div>
              <div className="flex gap-2">
                <button onClick={() => setRunModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
                <button onClick={handleRunPayroll} disabled={running} className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white text-xs font-bold rounded-xl cursor-pointer">
                  {running ? 'Processing...' : 'Run Payroll'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payslips Modal */}
      {payslipModalOpen && selectedRun && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-display font-bold text-sm">Payslips — {selectedRun.month}</h2>
              <button onClick={() => setPayslipModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {payslips.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No payslips generated for this run.</p>
              ) : payslips.map(slip => (
                <div key={slip.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-xl text-xs">
                  <div className="flex justify-between items-center border-b dark:border-slate-850 pb-3 mb-3">
                    <div>
                      <div className="font-extrabold text-sm">{slip.employeeName || 'Employee'}</div>
                      <span className="text-[10px] text-slate-400">{slip.designation}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Net Disbursed</div>
                      <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">{fmt(slip.netPaid)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-[10px]">
                    <div><span className="text-slate-400">Basic: </span><span className="font-bold">{fmt(slip.basicPaid)}</span></div>
                    <div><span className="text-slate-400">HRA: </span><span className="font-bold">{fmt(slip.hraPaid)}</span></div>
                    <div><span className="text-slate-400">Bonus: </span><span className="font-bold">{fmt(slip.bonusPaid || 0)}</span></div>
                    <div><span className="text-slate-400">PF: </span><span className="font-bold text-red-500">-{fmt(slip.deductPF)}</span></div>
                    <div><span className="text-slate-400">ESIC: </span><span className="font-bold text-red-500">-{fmt(slip.deductESIC)}</span></div>
                    <div><Download className="w-3 h-3 inline-block mr-0.5 text-slate-400" /><span className="text-brand-500 font-bold cursor-pointer hover:underline">Download PDF</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
