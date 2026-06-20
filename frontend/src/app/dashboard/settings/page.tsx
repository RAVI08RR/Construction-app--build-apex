'use client';

import React, { useState } from 'react';
import { useDashboard } from '../DashboardContext';
import {
  Settings, User, Building2, Shield, Bell, Palette, Key, Globe,
  Check, ChevronRight, Moon, Sun, Monitor, Lock, LogOut, Trash2, Save, X, Phone, Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const ROLES = [
  { role: 'OWNER', label: 'Owner / Builder', desc: 'Full access to all modules. Can approve payroll & manage tenant.', color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/25' },
  { role: 'PROJECT_MANAGER', label: 'Project Manager', desc: 'Manage tasks, reports, procurement. Cannot modify payroll settings.', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/25' },
  { role: 'SITE_ENGINEER', label: 'Site Engineer', desc: 'Submit site reports, log labour, view daily tasks only.', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/25' },
  { role: 'HR', label: 'HR Manager', desc: 'Manage employees, attendance, payroll processing.', color: 'text-pink-500', bg: 'bg-pink-500/10 border-pink-500/25' },
  { role: 'ACCOUNTANT', label: 'Accountant', desc: 'View and manage finance, invoices, and cost reports only.', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/25' },
];

const PLAN_FEATURES = [
  '✓ Unlimited Projects',
  '✓ Up to 50 Users',
  '✓ Geo-Attendance with 10 geofences',
  '✓ AI-Powered Analytics',
  '✓ Full ERP (Payroll, Assets, BOQ)',
  '✓ Priority Support (24h response)',
  '✓ Custom Branding (Logo + Colors)',
];

export default function SettingsPage() {
  const { user, activeRole, setActiveRole } = useDashboard();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Ravi Kumar',
    email: user?.email || 'ravi@apexbuilders.in',
    phone: '+91 98765 43210',
    designation: 'Managing Director',
  });

  // Notifications
  const [notifs, setNotifs] = useState({
    taskAssigned: true,
    reportSubmitted: true,
    payrollApproval: true,
    stockAlert: true,
    attendanceFraud: true,
    invoiceOverdue: false,
    weeklyDigest: true,
  });

  // Company
  const [companyForm, setCompanyForm] = useState({
    name: 'Apex Builders & Developers Pvt. Ltd.',
    gstin: '27AABCA1234F1Z5',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Office No. 401, Tower B, BKC, Mumbai - 400051',
    website: 'https://apexbuilders.in',
    plan: 'PROFESSIONAL',
  });

  const handleSave = () => {
    setSaved(true);
    confetti({ particleCount: 50, spread: 40, origin: { y: 0.6 } });
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-500" /> Settings & Preferences
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">Configure account, company, security, and workspace preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <div className="lg:w-52 shrink-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 space-y-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <tab.icon className="w-3.5 h-3.5 shrink-0" />
                {tab.label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-5">Account Profile</h2>
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-extrabold text-2xl">
                    {profileForm.name?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="font-extrabold text-base">{profileForm.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{activeRole}</div>
                    <button className="mt-1.5 text-[10px] text-indigo-500 font-bold hover:underline cursor-pointer">Change avatar photo</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text', icon: User },
                    { label: 'Email Address', key: 'email', type: 'email', icon: Mail },
                    { label: 'Mobile Number', key: 'phone', type: 'tel', icon: Phone },
                    { label: 'Designation', key: 'designation', type: 'text', icon: Building2 },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{field.label}</label>
                      <div className="relative">
                        <field.icon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type={field.type}
                          value={(profileForm as any)[field.key]}
                          onChange={e => setProfileForm(f => ({ ...f, [field.key]: e.target.value }))}
                          className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Switcher */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">Demo Role Switcher</h2>
                <p className="text-[10px] text-slate-400 font-medium mb-4">Switch your active role to experience different permission levels across the ERP.</p>
                <div className="space-y-2">
                  {ROLES.map(r => (
                    <button key={r.role} onClick={() => { (setActiveRole as any)?.(r.role); }}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all text-left ${activeRole === r.role ? `${r.bg} border-opacity-100` : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                      <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${activeRole === r.role ? r.color.replace('text-', 'bg-') : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-extrabold ${activeRole === r.role ? r.color : 'text-slate-700 dark:text-slate-200'}`}>{r.label}</div>
                        <div className="text-[9px] text-slate-400 font-medium mt-0.5">{r.desc}</div>
                      </div>
                      {activeRole === r.role && <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${r.color}`} />}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer transition-all">
                {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
              </button>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-5">Company Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Company Name', key: 'name' },
                    { label: 'GSTIN', key: 'gstin' },
                    { label: 'City', key: 'city' },
                    { label: 'State', key: 'state' },
                    { label: 'Website', key: 'website' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{f.label}</label>
                      <input value={(companyForm as any)[f.key]} onChange={e => setCompanyForm(c => ({ ...c, [f.key]: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Address</label>
                    <textarea rows={2} value={companyForm.address} onChange={e => setCompanyForm(c => ({ ...c, address: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 resize-none" />
                  </div>
                </div>
              </div>

              {/* Subscription Plan */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Subscription Plan</h2>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg font-extrabold font-display text-indigo-500">PROFESSIONAL</span>
                      <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-500 text-[9px] font-extrabold rounded uppercase">Active</span>
                    </div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white mt-1">₹4,999/month · Renews July 20, 2026</div>
                  </div>
                  <button className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl cursor-pointer shadow-lg shadow-indigo-500/20">
                    Upgrade to Enterprise
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-3">
                  {PLAN_FEATURES.map(f => (
                    <div key={f} className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />{f.replace('✓ ', '')}
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-500/20">
                {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Save Company Info</>}
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Security Settings</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Current Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="password" defaultValue="••••••••" className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">New Password</label>
                    <div className="relative">
                      <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="password" placeholder="Enter new password" className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="password" placeholder="Repeat new password" className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                </div>
                <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-500/20 transition-all">
                  Update Password
                </button>
              </div>

              {/* 2FA */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold">Two-Factor Authentication</h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Add an extra layer of security with OTP via SMS or authenticator app.</p>
                  </div>
                  <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow"></div>
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  {[
                    { device: 'Chrome on Windows 11', ip: '103.21.58.42', location: 'Mumbai, IN', current: true },
                    { device: 'Safari on iPhone 15', ip: '110.235.14.8', location: 'Pune, IN', current: false },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <div>
                        <div className="text-xs font-bold flex items-center gap-2">
                          {session.device}
                          {session.current && <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-extrabold rounded border border-emerald-500/25">CURRENT</span>}
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium mt-0.5">{session.ip} · {session.location}</div>
                      </div>
                      {!session.current && (
                        <button className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer">Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Notification Preferences</h2>
              <div className="space-y-3">
                {Object.entries(notifs).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    taskAssigned: 'Task Assigned to Me',
                    reportSubmitted: 'New Site Report Submitted',
                    payrollApproval: 'Payroll Approval Required',
                    stockAlert: 'Low Stock Material Alert',
                    attendanceFraud: 'Geo-Attendance Fraud Alert',
                    invoiceOverdue: 'Invoice Overdue Reminder',
                    weeklyDigest: 'Weekly Progress Digest',
                  };
                  return (
                    <div key={key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <div>
                        <div className="text-xs font-bold">{labels[key]}</div>
                        <div className="text-[9px] text-slate-400 font-medium mt-0.5">Push notification + Email</div>
                      </div>
                      <button onClick={() => setNotifs(n => ({ ...n, [key]: !val }))}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${val ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-all ${val ? 'right-0.5' : 'left-0.5'}`}></div>
                      </button>
                    </div>
                  );
                })}
              </div>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-500/20">
                {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Save Preferences</>}
              </button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">Theme & Display</h2>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Monitor },
                  ] as const).map(t => (
                    <button key={t.id} onClick={() => setTheme(t.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${theme === t.id ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                      <t.icon className="w-5 h-5" />
                      <span className="text-xs font-bold">{t.label}</span>
                      {theme === t.id && <Check className="w-3 h-3 text-indigo-500" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">Accent Color</h2>
                <div className="flex gap-3">
                  {['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map(color => (
                    <button key={color} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 shadow-md cursor-pointer hover:scale-110 transition-transform" style={{ background: color }}></button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">Sidebar Density</h2>
                <div className="grid grid-cols-2 gap-3">
                  {['Compact', 'Comfortable'].map(d => (
                    <button key={d} className={`p-3 rounded-xl border text-xs font-bold cursor-pointer ${d === 'Comfortable' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>{d}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-500/20">
                {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Apply Theme</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
