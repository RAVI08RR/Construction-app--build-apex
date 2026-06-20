'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from './DashboardContext';
import { api } from '@/utils/api';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Coins,
  Hammer,
  FileCheck,
  Zap,
  Calendar,
  AlertCircle,
  HardHat,
  Search,
  Sparkles,
  Camera,
  Layers,
  Users,
  Activity,
  ShieldCheck,
  CloudUpload,
  CreditCard,
  Plus,
  Send,
  Wrench,
  Gauge,
  ClipboardList,
  MapPin,
  Maximize2,
  QrCode,
  ShieldAlert,
  Smartphone,
  CheckCircle,
  QrCode as QrIcon,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import confetti from 'canvas-confetti';

interface MetricData {
  totalProjects: number;
  activeProjects: number;
  delayedProjects: number;
  totalBudget: number;
  budgetUsed: number;
  pendingPayments: number;
  forecastCost: number;
  labourPresent: number;
  taskBreakdown: {
    PENDING: number;
    IN_PROGRESS: number;
    COMPLETED: number;
    DELAYED: number;
  };
  revenue: number;
  riskScore: number;
}

const cashFlowData = [
  { name: 'Jan', Budget: 10, Spent: 5 },
  { name: 'Feb', Budget: 15, Spent: 8 },
  { name: 'Mar', Budget: 20, Spent: 12 },
  { name: 'Apr', Budget: 30, Spent: 18 },
  { name: 'May', Budget: 40, Spent: 21 },
  { name: 'Jun', Budget: 50, Spent: 22.5 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function RedesignedMetricsDashboard() {
  const { activeRole, refreshTrigger, triggerRefresh, activeProjectId } = useDashboard();
  
  // Dashboard submenu tabs
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'SCHEDULES' | 'PROCUREMENT' | 'OPERATIONS'>('OVERVIEW');

  // Page States
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [upcomingMilestones, setUpcomingMilestones] = useState<any[]>([]);
  const [boqItems, setBoqItems] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Expanded HRMS states
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [payrollSummary, setPayrollSummary] = useState<any>({ totalPayroll: 1850000, distributedAmt: 1620000 });
  const [assets, setAssets] = useState<any[]>([]);

  // Geo-fence simulator states
  const [simulateLat, setSimulateLat] = useState(28.6142); // At site
  const [simulateLng, setSimulateLng] = useState(77.2088);
  const [selectedLocation, setSelectedLocation] = useState<'SITE' | 'REMOTE'>('SITE');
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState<string | null>(null);
  const [distanceCalculated, setDistanceCalculated] = useState(42); // meters

  // QR scan simulator states
  const [scannedAsset, setScannedAsset] = useState<any>(null);

  // Quick Action Center Modals
  const [activeActionModal, setActiveActionModal] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [reportWork, setReportWork] = useState('');
  const [reportLabour, setReportLabour] = useState(25);
  const [docName, setDocName] = useState('');
  const [poAmount, setPoAmount] = useState(500000);
  const [poNumber, setPoNumber] = useState('PO-2026-045');

  useEffect(() => {
    const fetchSaaSData = async () => {
      setLoading(true);
      const res = await api.get<any>('/dashboard/metrics');
      if (res.data) {
        setMetrics(res.data.metrics);
        setUpcomingMilestones(res.data.upcomingMilestones);
        setBoqItems(res.data.boqItems);
        setEquipments(res.data.equipments);
        setApprovals(res.data.approvals);
        setAuditLogs(res.data.auditLogs);
        
        // HRMS arrays compilation
        setEmployees(res.data.employees || []);
        setAttendanceLogs(res.data.attendance || []);
        setPayrollSummary(res.data.payrollRun || { totalPayroll: 1850000, distributedAmt: 1620000 });
        setAssets(res.data.assets || []);
      } else {
        // Fallback seed values
        setMetrics({
          totalProjects: 3,
          activeProjects: 1,
          delayedProjects: 1,
          totalBudget: 450000000,
          budgetUsed: 225000000,
          pendingPayments: 110000000,
          forecastCost: 480000000,
          labourPresent: 22,
          taskBreakdown: { PENDING: 2, IN_PROGRESS: 1, COMPLETED: 3, DELAYED: 1 },
          revenue: 120000000,
          riskScore: 68,
        });
        setUpcomingMilestones([
          { id: 'ms-2', name: 'Superstructure Framework', dueDate: '2026-06-30', progress: 75, projectName: 'Luxury Villa - Sector 54' },
          { id: 'ms-3', name: 'Brickwork & Plastering', dueDate: '2026-09-15', progress: 30, projectName: 'Luxury Villa - Sector 54' }
        ]);
        setEmployees([
          { id: 'emp-3', employeeId: 'EMP-2026-003', name: 'Arun Patel', designation: 'Site Engineer', department: 'OPERATIONS', salaryBasic: 65000, status: 'ACTIVE' },
          { id: 'emp-4', employeeId: 'EMP-2026-004', name: 'Priya Iyer', designation: 'Chief Architect', department: 'ENGINEERING', salaryBasic: 110000, status: 'ACTIVE' }
        ]);
        setAttendanceLogs([
          { id: 'att-1', employeeName: 'Arun Patel', date: '2026-06-20', checkIn: '09:00 AM', status: 'PRESENT', distanceMtrs: 42, isFraudFlag: false },
          { id: 'att-3', employeeName: 'Priya Iyer', date: '2026-06-20', checkIn: '09:30 AM', status: 'PRESENT', distanceMtrs: 2250, isFraudFlag: true, fraudRemarks: 'Checkin location 2.2km away from geofence radius.' }
        ]);
        setAssets([
          { id: 'as-1', assetId: 'AST-EXC-002', name: 'CAT Excavator 320D', category: 'MACHINERY', value: 4500000, status: 'ASSIGNED', operatorName: 'Arun Patel', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AST-EXC-002' },
          { id: 'as-3', assetId: 'AST-DRL-084', name: 'Hilti Concrete Drill', category: 'SAFETY_GEAR', value: 65000, status: 'AVAILABLE', operatorName: 'Unassigned', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AST-DRL-084' }
        ]);
      }
      setLoading(false);
    };
    fetchSaaSData();
  }, [refreshTrigger, activeProjectId]);

  // GPS Selector handler
  const handleLocationSimulation = (loc: 'SITE' | 'REMOTE') => {
    setSelectedLocation(loc);
    if (loc === 'SITE') {
      setSimulateLat(28.6142);
      setSimulateLng(77.2088);
      setDistanceCalculated(42);
    } else {
      setSimulateLat(28.5355);
      setSimulateLng(77.3910);
      setDistanceCalculated(2250);
    }
  };

  // Checkin submit simulation
  const handleGeoCheckinSubmit = async () => {
    if (distanceCalculated > 200) {
      alert("ATTENDANCE BLOCKED: Geofence radius mismatch. You must check-in within 200 meters of the Luxury Villa construction site.");
      return;
    }
    
    setCheckinSuccess("VERIFYING...");
    setTimeout(() => {
      confetti({ particleCount: 60, spread: 40 });
      setCheckinSuccess("SUCCESSFUL");
      
      // Push new record locally
      const mockRecord = {
        id: `att-${Date.now()}`,
        employeeName: activeRole === 'OWNER' ? 'Rajesh Sharma' : 'Vikram Malhotra',
        date: '2026-06-20',
        checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'PRESENT',
        distanceMtrs: distanceCalculated,
        isFraudFlag: false,
      };
      setAttendanceLogs(prev => [mockRecord, ...prev]);
    }, 1500);
  };

  const handleQuickAction = async (e: React.FormEvent, type: string) => {
    e.preventDefault();
    confetti({ particleCount: 80, spread: 50 });
    
    if (type === 'TASK') {
      await api.post('/tasks', { title: taskTitle, description: taskDesc, projectId: activeProjectId });
      setTaskTitle(''); setTaskDesc('');
    } else if (type === 'REPORT') {
      await api.post('/reports', { projectId: activeProjectId, workCompleted: reportWork, labourCount: reportLabour, reportDate: '2026-06-20' });
      setReportWork('');
    } else if (type === 'PO') {
      await api.post('/uploads/presigned-url', { fileName: `PO-${poNumber}.pdf`, mimeType: 'application/pdf', projectId: activeProjectId });
      setPoNumber('');
    }

    setActiveActionModal(null);
    triggerRefresh();
  };

  const formatPercentage = (numerator: number, denominator: number) => {
    if (!denominator) return '0%';
    return `${((numerator / denominator) * 100).toFixed(0)}%`;
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-400">Loading Cockpit Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Overview stats panel */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">Enterprise Cockpit</h1>
          <p className="text-sm text-slate-400">Autodesk & Procore unified construction ERP + HRMS intelligence board.</p>
        </div>

        {/* Floating Quick Action Center */}
        {activeRole !== 'CLIENT' && (
          <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveActionModal('TASK')}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-850 border dark:border-slate-800 text-[10px] font-bold uppercase rounded-lg hover:text-brand-500 cursor-pointer shadow-sm"
            >
              <Plus className="w-3 h-3" /> Task
            </button>
            <button
              onClick={() => setActiveActionModal('REPORT')}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-850 border dark:border-slate-800 text-[10px] font-bold uppercase rounded-lg hover:text-brand-500 cursor-pointer shadow-sm"
            >
              <Plus className="w-3 h-3" /> Report
            </button>
            <button
              onClick={() => setActiveActionModal('DRAWING')}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-850 border dark:border-slate-800 text-[10px] font-bold uppercase rounded-lg hover:text-brand-500 cursor-pointer shadow-sm"
            >
              <CloudUpload className="w-3 h-3" /> Drawing
            </button>
            <button
              onClick={() => setActiveActionModal('PO')}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-850 border dark:border-slate-800 text-[10px] font-bold uppercase rounded-lg hover:text-brand-500 cursor-pointer shadow-sm"
            >
              <CreditCard className="w-3 h-3" /> PO Order
            </button>
          </div>
        )}
      </div>

      {/* Grid tabs switcher navigation */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800">
        {(['OVERVIEW', 'SCHEDULES', 'PROCUREMENT', 'OPERATIONS'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] cursor-pointer ${
              activeSubTab === tab
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
            }`}
          >
            {tab === 'OPERATIONS' ? 'HRMS & Payroll' : tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: GENERAL OVERVIEW */}
      {/* ============================================================== */}
      {activeSubTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Main ERP metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
            <div className="glass-panel rounded-2xl p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Projects</span>
              <div className="text-2xl font-display font-extrabold mt-1">{metrics.activeProjects}</div>
            </div>
            <div className="glass-panel rounded-2xl p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Budget Spent</span>
              <div className="text-2xl font-display font-extrabold text-brand-500 mt-1">45%</div>
            </div>
            <div className="glass-panel rounded-2xl p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Staff Present</span>
              <div className="text-2xl font-display font-extrabold text-accent-cyan mt-1">
                {attendanceLogs.filter(a => !a.isFraudFlag).length} <span className="text-xs font-bold text-slate-400">Present</span>
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Labour Strength</span>
              <div className="text-2xl font-display font-extrabold text-accent-blue mt-1">{metrics.labourPresent}</div>
            </div>
            <div className="glass-panel rounded-2xl p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Asset Allocation</span>
              <div className="text-2xl font-display font-extrabold text-accent-violet mt-1">
                {formatPercentage(assets.filter(a => a.status === 'ASSIGNED').length, assets.length)}
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Attendance spoofs</span>
              <div className="text-2xl font-display font-extrabold text-accent-rose mt-1">
                {attendanceLogs.filter(a => a.isFraudFlag).length} Alert
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* AI Insights panel */}
            <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-500" />
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450">AI Copilot Predictions</h3>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl space-y-3.5 text-xs font-bold">
                  <div className="flex justify-between">
                    <span>Month-End Labour Cost</span>
                    <span className="text-accent-rose">₹16.5 Lakhs <span className="text-[9px] text-slate-400">(vs ₹12L planned)</span></span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stock Depletion Risk</span>
                    <span className="text-yellow-500">Steel: 7 Days left</span>
                  </div>
                  <div className="text-[11px] leading-relaxed text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-850">
                    <span className="font-bold text-slate-850 dark:text-slate-200 block mb-1">Attendance Spoof Risk:</span>
                    Priya Iyer attendance flag raised. Multi-device checkin spoofing detected from coordinates 2.2km away from geofence.
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850/80 text-[10px] text-slate-450 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent-emerald" /> Audit status: verified
              </div>
            </div>

            {/* Construction Progress bars */}
            <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-5">Execution Status</h3>
                <div className="space-y-3.5">
                  {[
                    { label: 'Foundation Work', val: 100, color: 'bg-accent-emerald' },
                    { label: 'Superstructure Framework', val: 80, color: 'bg-accent-blue' },
                    { label: 'MEP (Electrical & Plumb)', val: 40, color: 'bg-accent-cyan' },
                    { label: 'Finishing & Painting', val: 20, color: 'bg-accent-violet' },
                  ].map(item => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>{item.label}</span>
                        <span>{item.val}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-full h-2 overflow-hidden">
                        <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Operations activity log */}
            <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450 mb-4">Operations Log</h3>
                <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                  {[
                    { text: 'Arun Patel submitted Daily Site Report', time: '10m ago' },
                    { text: 'Cement stock decreased to 450 bags', time: '1h ago' },
                    { text: 'Drawing V4 Approved by Priya Iyer', time: '3h ago' },
                    { text: 'Slab Casting Task marked In Progress', time: '5h ago' },
                    { text: 'Invoice #8472 bill approved for payment', time: '1d ago' },
                  ].map((act, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <span className="h-2 w-2 rounded-full bg-brand-500 mt-1.5 shrink-0 animate-pulse-subtle"></span>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{act.text}</p>
                        <span className="text-[10px] text-slate-400">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Cash Flow Forecast area chart */}
          <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450 mb-1">Cash Flow Forecast</h3>
              <p className="text-xs text-slate-400 mb-6">Comparison of total project budgets, actual expenditure spent, and cost projections (in Crore ₹).</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <defs>
                    <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="Budget" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBudget)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Spent" stroke="#ea580c" fillOpacity={1} fill="url(#colorSpent)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SCHEDULES */}
      {/* ============================================================== */}
      {activeSubTab === 'SCHEDULES' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gantt Timeline */}
            <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450 mb-1">Gantt Milestone Schedule</h3>
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
                    <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-lg h-5 relative">
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
            <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450 mb-4">Inspection Calendar</h3>
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 mb-2 border-b dark:border-slate-850 pb-2">
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
                            : 'hover:bg-slate-100 dark:hover:bg-slate-850'
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
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PROCUREMENT */}
      {/* ============================================================== */}
      {activeSubTab === 'PROCUREMENT' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Materials stock progress levels */}
            <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450 mb-4">Material Inventory</h3>
                <div className="space-y-3.5">
                  {[
                    { label: 'OPC Cement (bags)', current: 450, total: 1000, pct: 45, fill: '#ea580c' },
                    { label: 'TMT Steel (tons)', current: 18, total: 25, pct: 72, fill: '#3b82f6' },
                  ].map(mat => (
                    <div key={mat.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>{mat.label}</span>
                        <span className="text-slate-400">{mat.current} / {mat.total}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 rounded-full" style={{ width: `${mat.pct}%`, backgroundColor: mat.fill }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Procurement pipe dashboard */}
            <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450 mb-4">Procurement Pipelines</h3>
                <div className="grid grid-cols-2 gap-4 text-center text-xs">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block">Draft Orders</span>
                    <span className="text-2xl font-extrabold">4</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block">Sent PO RFQs</span>
                    <span className="text-2xl font-extrabold text-accent-blue">2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document approvals engine */}
            <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450 mb-4">Approvals workflow inbox</h3>
                <div className="space-y-3.5">
                  {approvals.map(app => (
                    <div key={app.id} className="flex items-center justify-between text-xs p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl font-bold">
                      <div>
                        <div>{app.title}</div>
                        <span className="text-[9px] text-slate-400 uppercase">{app.targetType}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            confetti({ particleCount: 40 });
                            setApprovals(prev => prev.filter(a => a.id !== app.id));
                          }}
                          className="px-2 py-1 bg-accent-emerald text-white text-[9px] rounded-lg cursor-pointer"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: HRMS & PAYROLL & ASSET GEOLOCATIONS (MASTER PIECE) */}
      {/* ============================================================== */}
      {activeSubTab === 'OPERATIONS' && (
        <div className="space-y-6">
          
          {/* Geo-Fencing Check-In & Attendance Fraud Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Geo Attendance checkin simulator widget (Employee mobile app simulation) */}
            <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-[30px]" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-brand-500" />
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450">Mobile check-in portal</h3>
                  </div>
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-950 px-2 py-0.5 border dark:border-slate-850 text-slate-450 font-bold uppercase rounded">Device GPS</span>
                </div>

                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-2xl text-xs">
                  
                  {/* Site targets coords */}
                  <div className="flex justify-between border-b dark:border-slate-850 pb-2 text-[11px] font-bold text-slate-400">
                    <span>Project Coordinates:</span>
                    <span>28.6139° N, 77.2090° E</span>
                  </div>

                  {/* Simulator select coordinates */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Simulate Employee Location</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleLocationSimulation('SITE')}
                        className={`py-2 rounded-xl text-center text-xs font-bold border transition-all ${
                          selectedLocation === 'SITE'
                            ? 'bg-brand-500 border-brand-500 text-white shadow'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        At Site (42m away)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLocationSimulation('REMOTE')}
                        className={`py-2 rounded-xl text-center text-xs font-bold border transition-all ${
                          selectedLocation === 'REMOTE'
                            ? 'bg-brand-500 border-brand-500 text-white shadow'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        Remote (2.2km away)
                      </button>
                    </div>
                  </div>

                  {/* Distance coordinates indicators */}
                  <div className="flex justify-between pt-1">
                    <span>Calculated distance:</span>
                    <span className={`font-extrabold ${distanceCalculated <= 200 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                      {distanceCalculated} Meters ({distanceCalculated <= 200 ? 'Inside Geofence' : 'Fence Mismatch'})
                    </span>
                  </div>

                  {/* Selfie Upload Simulation */}
                  <div className="pt-2 border-t dark:border-slate-850 flex items-center justify-between">
                    <span>Selfie Verification:</span>
                    <button
                      type="button"
                      onClick={() => setSelfieCaptured(true)}
                      className={`px-3 py-1 border text-[10px] font-bold uppercase rounded-lg ${
                        selfieCaptured ? 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald' : 'hover:border-brand-500/30'
                      }`}
                    >
                      {selfieCaptured ? 'Captured ✓' : 'Take Selfie'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit checkin */}
              <div className="pt-4 border-t dark:border-slate-850 flex items-center justify-between">
                {checkinSuccess ? (
                  <span className={`text-xs font-extrabold flex items-center gap-1 ${
                    checkinSuccess === 'SUCCESSFUL' ? 'text-accent-emerald' : 'text-slate-400'
                  }`}>
                    <CheckCircle className="w-4 h-4" /> Check-in: {checkinSuccess}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ready to Check-in</span>
                )}
                
                <button
                  type="button"
                  onClick={handleGeoCheckinSubmit}
                  disabled={!selfieCaptured || checkinSuccess === 'SUCCESSFUL'}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Verify GPS Check-In
                </button>
              </div>

            </div>

            {/* Attendance Logs List & AI Fraud alerts */}
            <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450">Geo Attendance Logs</h3>
                  <span className="text-[9px] bg-accent-rose/10 text-accent-rose px-2 py-0.5 border border-accent-rose/20 rounded font-bold">1 Fraud Flagged</span>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {attendanceLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center text-xs p-3 rounded-xl border font-bold ${
                        log.isFraudFlag
                          ? 'bg-accent-rose/5 border-accent-rose/20 text-accent-rose'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200/60 dark:border-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 rounded-full ${log.isFraudFlag ? 'bg-accent-rose animate-pulse-subtle' : 'bg-accent-emerald'}`}></span>
                        <div>
                          <div>{log.employeeName}</div>
                          <span className="text-[9px] text-slate-400 font-semibold">{log.isFraudFlag ? log.fraudRemarks : `Checked in: ${log.checkIn}`}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">{log.distanceMtrs}m away</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Salary distributions and Labour sheets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Salary distribution Card */}
            <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450">Payroll Run Summary</h3>
                  <span className="text-[9px] bg-accent-blue/15 text-accent-blue px-2 py-0.5 border border-accent-blue/20 rounded font-bold uppercase tracking-wider">June 2026</span>
                </div>
                <div className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(payrollSummary.totalPayroll)}
                </div>
                
                <div className="space-y-3.5 pt-4 text-xs font-bold border-t dark:border-slate-850/80 mt-4">
                  <div className="flex justify-between">
                    <span>Salary Distributed:</span>
                    <span className="text-accent-emerald">{formatCurrency(payrollSummary.distributedAmt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Bank Transfer:</span>
                    <span className="text-accent-rose">{formatCurrency(payrollSummary.totalPayroll - payrollSummary.distributedAmt)}</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Payroll Complete: {((payrollSummary.distributedAmt / payrollSummary.totalPayroll) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 border dark:border-slate-850 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-accent-emerald h-1.5 rounded-full" style={{ width: `${(payrollSummary.distributedAmt / payrollSummary.totalPayroll) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {activeRole === 'OWNER' && (
                <button
                  onClick={() => {
                    confetti({ particleCount: 50 });
                    setPayrollSummary(prev => ({ ...prev, distributedAmt: prev.totalPayroll }));
                  }}
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 cursor-pointer mt-4"
                >
                  Approve Remaining Bank Transfers
                </button>
              )}
            </div>

            {/* Daily Labour Trade counts count */}
            <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450 mb-4">Labour Trade Sheet</h3>
                <div className="grid grid-cols-2 gap-3.5 text-xs text-center font-bold">
                  {[
                    { trade: 'Mason', count: 10, fill: 'border-l-brand-500' },
                    { trade: 'Painter', count: 6, fill: 'border-l-accent-cyan' },
                    { trade: 'Electrician', count: 3, fill: 'border-l-accent-blue' },
                    { trade: 'Helper', count: 12, fill: 'border-l-accent-violet' },
                  ].map(l => (
                    <div key={l.trade} className={`p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 border-l-4 ${l.fill} rounded-xl`}>
                      <span className="text-[10px] text-slate-400 block mb-0.5">{l.trade}</span>
                      <span className="text-lg font-extrabold">{l.count} present</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Employee Leaves summary */}
            <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450 mb-4">Leave approvals inbox</h3>
                <div className="space-y-3.5 text-xs font-bold">
                  {[
                    { name: 'Neha Kapoor', type: 'SICK', dates: 'Jun 22 - Jun 24', reason: 'Fever recovery' }
                  ].map((lv, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl flex justify-between items-center">
                      <div>
                        <div>{lv.name} ({lv.type})</div>
                        <span className="text-[10px] text-slate-450 font-semibold">{lv.dates}</span>
                      </div>
                      <button
                        onClick={() => {
                          confetti({ particleCount: 30 });
                          alert("Leave Approved successfully!");
                        }}
                        className="px-2.5 py-1 bg-accent-emerald text-white text-[10px] rounded-lg cursor-pointer"
                      >
                        Approve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Asset QR scanning inventory dashboard registry */}
          <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b dark:border-slate-850 pb-3">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450">SaaS Asset Inventory Tracking</h3>
                <p className="text-[11px] text-slate-400">Scanned QR configurations and current operators assignees.</p>
              </div>

              {/* QR Scan simulator triggers */}
              <div className="flex gap-2">
                <select
                  onChange={e => {
                    const matched = assets.find(a => a.assetId === e.target.value);
                    setScannedAsset(matched || null);
                  }}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border dark:border-slate-750 text-xs rounded cursor-pointer"
                >
                  <option value="">Simulate QR Scan...</option>
                  {assets.map(a => (
                    <option key={a.assetId} value={a.assetId}>{a.assetId} - {a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scanned result box */}
            {scannedAsset && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-brand-500/20 rounded-2xl flex items-center justify-between text-xs font-bold animate-scale-up">
                <div className="flex items-center gap-4">
                  <QrIcon className="w-10 h-10 text-brand-500 bg-brand-500/10 p-2 rounded-xl" />
                  <div>
                    <div className="text-brand-500 font-extrabold">QR Scanned: {scannedAsset.assetId}</div>
                    <div className="text-slate-850 dark:text-slate-250 mt-0.5">{scannedAsset.name}</div>
                    <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Category: {scannedAsset.category} • Operator: {scannedAsset.operatorName}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      alert(`Asset ${scannedAsset.assetId} verified. Status: ${scannedAsset.status}`);
                      setScannedAsset(null);
                    }}
                    className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-350 rounded-lg cursor-pointer"
                  >
                    Close Verification
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Asset ID</th>
                    <th className="py-2.5 px-4">Asset Name</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Assigned Operator</th>
                    <th className="py-2.5 px-4 text-center">QR Code</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {assets.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-550 dark:text-slate-350">{a.assetId}</td>
                      <td className="py-3 px-4 font-bold">{a.name}</td>
                      <td className="py-3 px-4 text-slate-400">{a.category}</td>
                      <td className="py-3 px-4 text-slate-550 dark:text-slate-350">{a.operatorName}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <img src={a.qrCodeUrl} alt="Asset QR code" className="h-9 w-9 border dark:border-slate-750 p-0.5 rounded bg-white" />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          a.status === 'AVAILABLE'
                            ? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/25'
                            : a.status === 'ASSIGNED'
                            ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/25'
                            : 'bg-accent-rose/15 text-accent-rose border border-accent-rose/25'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* QUICK ACTIONS MODALS INTERFACES */}
      {/* ============================================================== */}
      {activeActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">
                {activeActionModal === 'TASK' && 'Quick Assign Task'}
                {activeActionModal === 'REPORT' && 'Log Onsite Activity'}
                {activeActionModal === 'DRAWING' && 'Transmit Drawing Plan'}
                {activeActionModal === 'PO' && 'Authorize Purchase Order'}
              </h3>
              <button onClick={() => setActiveActionModal(null)} className="text-slate-400 hover:text-slate-505"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={e => handleQuickAction(e, activeActionModal)}>
              <div className="p-6 space-y-4">
                
                {activeActionModal === 'TASK' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Task Title</label>
                      <input
                        type="text"
                        required
                        value={taskTitle}
                        onChange={e => setTaskTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs"
                        placeholder="e.g. Clean site area"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                      <textarea
                        rows={2}
                        value={taskDesc}
                        onChange={e => setTaskDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs resize-none"
                        placeholder="Task parameters..."
                      />
                    </div>
                  </>
                )}

                {activeActionModal === 'REPORT' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Work Completed Today</label>
                      <textarea
                        rows={2}
                        required
                        value={reportWork}
                        onChange={e => setReportWork(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs resize-none"
                        placeholder="Actions finished onsite..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Workers Count</label>
                      <input
                        type="number"
                        required
                        value={reportLabour}
                        onChange={e => setReportLabour(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs"
                      />
                    </div>
                  </>
                )}

                {activeActionModal === 'DRAWING' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Blueprint File Title</label>
                      <input
                        type="text"
                        required
                        value={docName}
                        onChange={e => setDocName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs"
                        placeholder="e.g. Electrical Layout V4.pdf"
                      />
                    </div>
                    <div className="p-6 border border-dashed border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 rounded-xl text-center text-xs">
                      <CloudUpload className="w-8 h-8 text-slate-350 dark:text-slate-700 mx-auto mb-1.5" />
                      <span>Ready to transmit directly to secure S3 storage bucket</span>
                    </div>
                  </>
                )}

                {activeActionModal === 'PO' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">PO Number</label>
                        <input
                          type="text"
                          required
                          value={poNumber}
                          onChange={e => setPoNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Total Amount (₹)</label>
                        <input
                          type="number"
                          required
                          value={poAmount}
                          onChange={e => setPoAmount(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}

              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-2">
                <button type="button" onClick={() => setActiveActionModal(null)} className="text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer">Submit Action</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
