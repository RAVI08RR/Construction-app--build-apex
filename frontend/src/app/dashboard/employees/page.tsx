'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../DashboardContext';
import { api } from '@/utils/api';
import { Users, Plus, Search, Pencil, Trash2, Eye, X, ChevronDown, UserCheck } from 'lucide-react';

const DEPARTMENTS = ['ADMIN', 'ENGINEERING', 'OPERATIONS', 'HR', 'ACCOUNTS', 'PROCUREMENT', 'SAFETY', 'QUALITY'];
const DESIGNATIONS = ['Managing Director / Builder', 'Project Director', 'Senior Project Manager', 'Site Engineer', 'Chief Architect', 'HR Manager', 'Accountant', 'Store Manager', 'Labour Supervisor', 'Safety Officer'];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25',
  INACTIVE: 'bg-red-500/15 text-red-500 border border-red-500/25',
  ON_LEAVE: 'bg-amber-500/15 text-amber-500 border border-amber-500/25',
};

const DEPT_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  ENGINEERING: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  OPERATIONS: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
  HR: 'bg-pink-500/10 text-pink-500 border border-pink-500/20',
  ACCOUNTS: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
  PROCUREMENT: 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20',
  SAFETY: 'bg-red-500/10 text-red-500 border border-red-500/20',
  QUALITY: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
};

const EMPTY_FORM = {
  name: '', email: '', mobile: '', department: 'ENGINEERING', designation: '',
  salaryBasic: '', allowanceHRA: '', allowanceMisc: '', status: 'ACTIVE', joiningDate: '',
};

export default function EmployeesPage() {
  const { activeProjectId } = useDashboard();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const res = await api.get<any>('/employees');
    if (res.data && Array.isArray(res.data)) {
      setEmployees(res.data);
    } else {
      // Fallback to dashboard metrics
      const metrics = await api.get<any>('/dashboard/metrics');
      setEmployees(metrics.data?.employees || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees, activeProjectId]);

  const handleOpenAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditMode(false);
    setSelectedEmployee(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (emp: any) => {
    setForm({
      name: emp.name || '',
      email: emp.email || '',
      mobile: emp.mobile || '',
      department: emp.department || 'ENGINEERING',
      designation: emp.designation || '',
      salaryBasic: emp.salaryBasic || '',
      allowanceHRA: emp.allowanceHRA || '',
      allowanceMisc: emp.allowanceMisc || '',
      status: emp.status || 'ACTIVE',
      joiningDate: emp.joiningDate ? emp.joiningDate.slice(0, 10) : '',
    });
    setSelectedEmployee(emp);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleOpenView = (emp: any) => {
    setSelectedEmployee(emp);
    setViewModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      salaryBasic: Number(form.salaryBasic),
      allowanceHRA: Number(form.allowanceHRA),
      allowanceMisc: Number(form.allowanceMisc),
    };
    if (editMode && selectedEmployee) {
      await api.put(`/employees/${selectedEmployee.id}`, payload);
    } else {
      await api.post('/employees', payload);
    }
    await fetchEmployees();
    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/employees/${id}`);
    setDeleteConfirm(null);
    await fetchEmployees();
  };

  const filtered = employees.filter(emp => {
    const matchSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = deptFilter === 'ALL' || emp.department === deptFilter;
    return matchSearch && matchDept;
  });

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'ACTIVE').length,
    onLeave: employees.filter(e => e.status === 'ON_LEAVE').length,
    totalPayroll: employees.reduce((s, e) => s + (Number(e.salaryBasic) || 0) + (Number(e.allowanceHRA) || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-400">Loading employee registry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Employees Directory
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your workforce — profiles, roles, salaries & documents.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Employee
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: stats.total, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Active', value: stats.active, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'On Leave', value: stats.onLeave, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Monthly Payroll', value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats.totalPayroll), color: 'text-brand-500', bg: 'bg-brand-500/10', small: true },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <Users className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <div className={`${stat.small ? 'text-sm' : 'text-xl'} font-extrabold font-display ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-slate-400 font-semibold">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee name, email, designation..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Workforce Registry <span className="ml-2 text-indigo-500">({filtered.length})</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4 text-right">Salary (Basic)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 text-xs font-semibold">
                    No employees found. <button onClick={handleOpenAdd} className="text-indigo-500 font-bold underline ml-1">Add one</button>
                  </td>
                </tr>
              ) : filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">{emp.employeeId || '—'}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-extrabold text-[10px] shrink-0">
                        {emp.name?.[0] || '?'}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white">{emp.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">{emp.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${DEPT_COLORS[emp.department] || 'bg-slate-100 text-slate-500'}`}>
                      {emp.department}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium max-w-[180px] truncate">{emp.designation}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-white">
                    {emp.salaryBasic ? `₹${Number(emp.salaryBasic).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${STATUS_STYLES[emp.status] || 'bg-slate-100 text-slate-400'}`}>
                      {emp.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => handleOpenView(emp)} title="View" className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-500 transition-colors cursor-pointer">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleOpenEdit(emp)} title="Edit" className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-500/10 text-slate-500 hover:text-amber-500 transition-colors cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(emp.id)} title="Delete" className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-colors cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-500" />
                <h2 className="font-display font-bold text-sm">{editMode ? 'Edit Employee' : 'Add New Employee'}</h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Vikram Malhotra" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="email@company.com" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Mobile</label>
                  <input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="9876543210" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Department *</label>
                  <select required value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none cursor-pointer">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Designation</label>
                  <input value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                    list="designations-list"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Site Engineer" />
                  <datalist id="designations-list">{DESIGNATIONS.map(d => <option key={d} value={d} />)}</datalist>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Joining Date</label>
                  <input type="date" value={form.joiningDate} onChange={e => setForm(f => ({ ...f, joiningDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none cursor-pointer">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ON_LEAVE">On Leave</option>
                  </select>
                </div>
              </div>
              <div className="border-t dark:border-slate-800 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Salary Structure (Monthly)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Basic (₹)</label>
                    <input type="number" value={form.salaryBasic} onChange={e => setForm(f => ({ ...f, salaryBasic: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                      placeholder="65000" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">HRA (₹)</label>
                    <input type="number" value={form.allowanceHRA} onChange={e => setForm(f => ({ ...f, allowanceHRA: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                      placeholder="13000" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Misc (₹)</label>
                    <input type="number" value={form.allowanceMisc} onChange={e => setForm(f => ({ ...f, allowanceMisc: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                      placeholder="5000" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer">
                  {saving ? 'Saving...' : editMode ? 'Update Employee' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-display font-bold text-sm">Employee Profile</h2>
              <button onClick={() => setViewModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-extrabold text-xl">
                  {selectedEmployee.name?.[0] || '?'}
                </div>
                <div>
                  <div className="font-bold text-base">{selectedEmployee.name}</div>
                  <div className="text-xs text-slate-400">{selectedEmployee.designation}</div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase mt-1 inline-block ${STATUS_STYLES[selectedEmployee.status] || ''}`}>{selectedEmployee.status}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Employee ID', value: selectedEmployee.employeeId || '—' },
                  { label: 'Department', value: selectedEmployee.department },
                  { label: 'Email', value: selectedEmployee.email },
                  { label: 'Mobile', value: selectedEmployee.mobile || '—' },
                  { label: 'Joining Date', value: selectedEmployee.joiningDate ? new Date(selectedEmployee.joiningDate).toLocaleDateString() : '—' },
                  { label: 'Basic Salary', value: selectedEmployee.salaryBasic ? `₹${Number(selectedEmployee.salaryBasic).toLocaleString('en-IN')}` : '—' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-3">
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">{item.label}</div>
                    <div className="font-bold text-slate-800 dark:text-white">{item.value}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setViewModalOpen(false); handleOpenEdit(selectedEmployee); }}
                className="w-full py-2.5 border border-indigo-500/30 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-500/10 transition-colors cursor-pointer">
                Edit This Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-sm font-bold text-center mb-2">Delete Employee?</h3>
            <p className="text-xs text-slate-400 text-center mb-5">This action cannot be undone. The employee record will be permanently removed.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-500/20 cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
