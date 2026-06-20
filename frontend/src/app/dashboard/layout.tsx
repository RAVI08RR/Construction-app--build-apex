'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  LayoutDashboard,
  FolderKanban,
  FileText,
  LogOut,
  ChevronDown,
  Menu,
  X,
  User,
  Shield,
  HardHat,
  Eye,
  Hammer,
  Search,
  Bell,
  Sparkles,
  Sun,
  Moon,
  TrendingUp,
  FileSpreadsheet,
  Coins,
  Send,
  MessageSquare,
  Bot,
  Users,
  Calendar,
  Wrench,
  BarChart,
  Settings,
  ShieldAlert,
  ClipboardCheck,
  Truck,
  Briefcase,
  Camera,
  Layers
} from 'lucide-react';
import { DashboardProvider, useDashboard } from './DashboardContext';
import { api } from '@/utils/api';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Command Palette State
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');

  // AI Assistant Drawer
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    {
      sender: 'bot',
      text: 'Hello Rajesh, I am your ApexBuild AI advisor. I have analyzed your structural materials, active tasks, and budgets. What insights do you need today?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const {
    user,
    activeRole,
    setActiveRole,
    activeProjectId,
    setActiveProjectId,
    projects,
  } = useDashboard();

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    api.clearToken();
    router.push('/');
  };

  // Grouped Sidebar links matching Procore / Rippling standards
  const coreLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/projects', label: 'Projects & Tasks', icon: FolderKanban },
    { href: '/dashboard/documents', label: 'Documents Store', icon: FileText },
  ];

  const erpLinks = [
    { href: '/dashboard/schedules', label: 'Tasks Schedule', icon: ClipboardCheck },
    { href: '/dashboard/reports', label: 'Daily Site Reports', icon: Camera },
    { href: '/dashboard/boq', label: 'BOQ Estimates', icon: FileSpreadsheet },
    { href: '/dashboard/procurement', label: 'Procurement Engine', icon: Truck },
    { href: '/dashboard/materials', label: 'Materials Inventory', icon: Layers },
    { href: '/dashboard/vendors', label: 'Vendor Directory', icon: Briefcase },
  ];

  const hrmsLinks = [
    { href: '/dashboard/employees', label: 'Employees Directory', icon: Users },
    { href: '/dashboard/attendance', label: 'Geo Attendance', icon: Calendar },
    { href: '/dashboard/labour', label: 'Labour Shift Logs', icon: HardHat },
    { href: '/dashboard/payroll', label: 'Payroll & Salaries', icon: Coins },
    { href: '/dashboard/assets', label: 'Asset QR Inventory', icon: Wrench },
  ];

  const adminLinks = [
    { href: '/dashboard/finance', label: 'Finance statements', icon: TrendingUp },
    { href: '/dashboard/analytics', label: 'Business Analytics', icon: BarChart },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'OWNER':
        return { label: 'Builder / Owner', bg: 'bg-brand-500/10 border-brand-500/30 text-brand-400', icon: Shield };
      case 'PROJECT_MANAGER':
        return { label: 'Project Manager', bg: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue', icon: User };
      case 'SITE_ENGINEER':
        return { label: 'Site Engineer', bg: 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan', icon: HardHat };
      case 'ARCHITECT':
        return { label: 'Architect', bg: 'bg-accent-violet/10 border-accent-violet/30 text-accent-violet', icon: Building2 };
      case 'CLIENT':
        return { label: 'Client (Read-only)', bg: 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald', icon: Eye };
      default:
        return { label: 'Contractor', bg: 'bg-slate-700/10 border-slate-700/30 text-slate-350', icon: Hammer };
    }
  };

  const currentRoleConfig = getRoleStyle(activeRole);
  const RoleIcon = currentRoleConfig.icon;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    const prompt = chatInput.toLowerCase();
    setChatInput('');

    setTimeout(() => {
      let reply = "I am processing that request. Would you like me to inspect check-in compliance logs or generate the payroll distribution slips?";
      
      if (prompt.includes('fraud') || prompt.includes('spoof') || prompt.includes('location')) {
        reply = "AI FRAUD ALERT: Employee Priya Iyer checked in from 2.2km away from Luxury Villa (geofence radius is 200m). Incident has been flagged on the Operations tab.";
      } else if (prompt.includes('payroll') || prompt.includes('salary') || prompt.includes('payslip')) {
        reply = "AI HR AUDIT: Total payroll for June is ₹18,50,000. ₹16,20,000 distributed. Pending balance of ₹2,30,000 is awaiting Builder authorization.";
      } else if (prompt.includes('asset') || prompt.includes('excavator') || prompt.includes('crane')) {
        reply = "AI ASSET STATUS: CAT Excavator is currently assigned to operator Arun Patel. Hilti Concrete Drill has been scanned at site via QR and is AVAILABLE.";
      }

      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 1000);
  };

  const commandPaletteItems = [
    { label: 'Navigate to Cockpit', action: () => router.push('/dashboard') },
    { label: 'Navigate to Projects', action: () => router.push('/dashboard/projects') },
    { label: 'Navigate to Documents', action: () => router.push('/dashboard/documents') },
    { label: 'Check-In (Geo Attendance)', action: () => router.push('/dashboard?tab=OPERATIONS') },
    { label: 'Track Construction Assets', action: () => router.push('/dashboard?tab=OPERATIONS') },
    { label: 'Audit Salary distributions', action: () => router.push('/dashboard?tab=OPERATIONS') },
    { label: 'Launch AI Copilot', action: () => setCopilotOpen(true) },
  ];

  const filteredCommands = commandPaletteItems.filter(item =>
    item.label.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  const LinkGroup = ({ title, links }: { title: string; links: any[] }) => (
    <div className="space-y-1">
      <span className="px-3 text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest block mb-2">{title}</span>
      {links.map(link => {
        const Icon = link.icon;
        const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
        return (
          <Link
            key={link.label}
            href={link.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold border transition-all ${
              isActive
                ? 'bg-brand-500/10 dark:bg-brand-500/5 text-brand-650 dark:text-brand-400 border-brand-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border-transparent'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {link.label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* 1. Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 shrink-0 select-none overflow-y-auto max-h-screen">
        <div className="space-y-5">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="p-2 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/15">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-extrabold text-sm tracking-tight">Apex<span className="text-brand-500">Build</span></span>
              <span className="block text-[8px] text-slate-400 font-bold tracking-widest uppercase leading-none mt-0.5">ERP & HRMS Platform</span>
            </div>
          </div>

          {/* Links Groups */}
          <div className="space-y-4">
            <LinkGroup title="Workspace" links={coreLinks} />
            <LinkGroup title="Construction ERP" links={erpLinks} />
            <LinkGroup title="HRMS & Assets" links={hrmsLinks} />
            <LinkGroup title="Administration" links={adminLinks} />
          </div>
        </div>

        {/* User logout card */}
        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 space-y-3.5">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500 font-bold border border-brand-500/20 text-xs">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-[11px] font-bold truncate text-slate-800 dark:text-slate-200">{user?.name || 'User'}</div>
              <div className="text-[9px] text-slate-400 truncate">{user?.email || 'user@apex.com'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-[10px] font-bold text-accent-rose hover:bg-accent-rose/5 border border-transparent hover:border-accent-rose/10 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Header & View content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Navbar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-550 hover:bg-slate-100"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Site selector */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Site Workspace:</span>
              <div className="relative">
                <select
                  value={activeProjectId}
                  onChange={e => setActiveProjectId(e.target.value)}
                  className="pl-3 pr-8 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none cursor-pointer"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Search Palette command */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1 border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-850 text-slate-450 hover:text-slate-600 rounded-lg text-xs cursor-pointer shadow-inner"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Center...</span>
              <kbd className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-[9px] border dark:border-slate-700 ml-1">Ctrl+K</kbd>
            </button>

            {/* Theme trigger */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 border border-slate-200 dark:border-slate-850 bg-slate-105 dark:bg-slate-850 rounded-lg text-slate-500 dark:text-slate-450 cursor-pointer"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-yellow-500" /> : <Moon className="w-3.5 h-3.5 text-slate-650" />}
            </button>

            {/* AI Assistant */}
            <button
              onClick={() => setCopilotOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-[11px] font-bold shadow-md cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden md:inline">AI Copilot</span>
            </button>

            {/* Simulation role select */}
            <div className="relative">
              <select
                value={activeRole}
                onChange={e => setActiveRole(e.target.value)}
                className="pl-7 pr-7 py-1 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="OWNER">Builder / Owner</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="SITE_ENGINEER">Site Engineer</option>
                <option value="CONTRACTOR">Contractor</option>
                <option value="ARCHITECT">Architect</option>
                <option value="CLIENT">Client</option>
              </select>
              <RoleIcon className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-450 pointer-events-none" />
              <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-450 pointer-events-none" />
            </div>
          </div>

        </header>

        {/* Frame container */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-55 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-64 bg-white dark:bg-slate-900 h-full p-5 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-display font-extrabold text-base">Apex<span className="text-brand-500">Build</span></span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <LinkGroup title="Workspace" links={coreLinks} />
                <LinkGroup title="Construction ERP" links={erpLinks} />
                <LinkGroup title="HRMS & Assets" links={hrmsLinks} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ctrl+K Palette */}
      {paletteOpen && (
        <div className="fixed inset-0 z-55 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-4 pt-[15vh]">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center border-b border-slate-150 dark:border-slate-800 px-4 py-3">
              <Search className="w-5 h-5 text-slate-400 mr-2.5" />
              <input
                type="text"
                autoFocus
                placeholder="Type command action..."
                value={paletteQuery}
                onChange={e => setPaletteQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white"
              />
              <button onClick={() => setPaletteOpen(false)} className="text-slate-450 hover:text-slate-650 text-xs border dark:border-slate-800 px-2 py-0.5 rounded">ESC</button>
            </div>

            <div className="max-h-[200px] overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400 italic">No actions found.</div>
              ) : (
                filteredCommands.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      item.action();
                      setPaletteOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-bold rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <span className="text-[9px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">Run</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Chat */}
      {copilotOpen && (
        <div className="fixed inset-y-0 right-0 z-55 w-full max-w-sm bg-white dark:bg-slate-900 border-l border-slate-250 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-slide-in-right">
          
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-500 rounded-lg text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xs text-slate-900 dark:text-white">AI Advisor</h3>
                <span className="text-[8px] text-accent-emerald font-bold uppercase tracking-wider block">Live audit mode</span>
              </div>
            </div>
            <button onClick={() => setCopilotOpen(false)} className="p-1 rounded-lg text-slate-450 hover:text-slate-650"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2 max-w-[80%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                {m.sender === 'bot' && (
                  <div className="h-6 w-6 rounded bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                  m.sender === 'user' ? 'bg-brand-500 text-white' : 'bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 text-slate-600 dark:text-slate-350'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-850 flex flex-wrap gap-1">
            <button onClick={() => setChatInput('Check Check-in Frauds')} className="px-2 py-0.5 border dark:border-slate-800 bg-white dark:bg-slate-900 rounded text-[9px] font-bold">🚨 Audit GPS Frauds</button>
            <button onClick={() => setChatInput('Calculate PF and Salary')} className="px-2 py-0.5 border dark:border-slate-800 bg-white dark:bg-slate-900 rounded text-[9px] font-bold">💸 Audit Payroll runs</button>
          </div>

          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-150 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask about geofence audits, payroll slips..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs"
            />
            <button type="submit" className="p-2 bg-brand-500 text-white rounded-lg"><Send className="w-3.5 h-3.5" /></button>
          </form>

        </div>
      )}

    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
