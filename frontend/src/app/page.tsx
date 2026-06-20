'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HardHat, Activity, UserCheck, ShieldAlert, Sparkles, Building2, Users2, ArrowRight } from 'lucide-react';
import { api } from '@/utils/api';

export default function LoginPage() {
  const router = useRouter();
  
  // Tab control: 'login' | 'register'
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password@123'); // Default for demo convenience
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Clear previous session
  useEffect(() => {
    api.clearToken();
    api.setActiveRole(null);
  }, []);

  // Quick login handler
  const handleQuickLogin = async (demoEmail: string, demoRole: string) => {
    setLoading(true);
    setError('');
    const res = await api.post<{ access_token: string; user: any }>('/auth/login', {
      email: demoEmail,
      password: 'Password@123',
    });

    setLoading(false);
    if (res.data) {
      api.setToken(res.data.access_token);
      api.setUser(res.data.user);
      api.setActiveRole(demoRole); // Bind initial role
      router.push('/dashboard');
    } else {
      setError(res.error || 'Connection to API failed. Entering Offline Demo mode.');
      // Offline fallback: if backend is not running, let's create a local mock login anyway!
      const mockUser = {
        id: `user-${demoRole.toLowerCase()}`,
        email: demoEmail,
        name: demoEmail.split('@')[0].toUpperCase(),
        role: demoRole === 'OWNER' ? 'OWNER' : 'MEMBER',
        tenantId: 'tenant-1',
      };
      api.setToken('mock-jwt-token');
      api.setUser(mockUser);
      api.setActiveRole(demoRole);
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (tab === 'login') {
      const res = await api.post<{ access_token: string; user: any }>('/auth/login', { email, password });
      setLoading(false);
      if (res.data) {
        api.setToken(res.data.access_token);
        api.setUser(res.data.user);
        api.setActiveRole(res.data.user.role === 'OWNER' ? 'OWNER' : 'PROJECT_MANAGER');
        router.push('/dashboard');
      } else {
        setError(res.error || 'Authentication failed');
      }
    } else {
      const res = await api.post<{ access_token: string; user: any }>('/auth/register', {
        email,
        password,
        fullName,
        companyName,
      });
      setLoading(false);
      if (res.data) {
        api.setToken(res.data.access_token);
        api.setUser(res.data.user);
        api.setActiveRole('OWNER');
        router.push('/dashboard');
      } else {
        setError(res.error || 'Registration failed');
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col md:flex-row items-stretch justify-between overflow-hidden">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent-cyan/10 rounded-full blur-[140px]" />

      {/* Left side: branding & specs */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-16 relative z-10 text-white max-w-3xl">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-white">Apex<span className="text-brand-500">Build</span></span>
            <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-widest leading-none">SaaS Platform</span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="my-12 md:my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-brand-400 mb-6 shadow-inner">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Construction ERP
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold leading-tight tracking-tight mb-6">
            Build Projects.<br/>
            Track Progress.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-orange-400 to-accent-cyan">
              Connect Every Role.
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mb-8 leading-relaxed">
            The unified platform linking builders, project managers, site engineers, architects, interior designers, clients, and vendors under one seamless multi-tenant architecture.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/80">
            <div>
              <div className="text-2xl font-bold font-display text-white">100%</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tenant Isolation</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-white">100ms</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Live Synchronization</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-white">Direct-to-S3</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">CAD File Uploads</div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500">
          © 2026 ApexBuild Systems, Inc. All rights reserved.
        </div>
      </div>

      {/* Right side: login card */}
      <div className="w-full md:w-[540px] flex items-center justify-center p-6 md:p-12 relative z-10 bg-slate-900/60 border-l border-slate-800/50 backdrop-blur-2xl">
        <div className="w-full max-w-md">
          
          {/* Headline */}
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-white mb-2">Welcome to ApexBuild</h2>
            <p className="text-sm text-slate-400">Collaborate on blueprints, schedules, and daily reports.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/20 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-accent-rose shrink-0" />
              <p className="text-xs text-accent-rose font-medium">{error}</p>
            </div>
          )}

          {/* Form Card */}
          <div className="glass-panel rounded-2xl border-slate-800 bg-slate-900/40 p-6 md:p-8 shadow-2xl">
            {/* Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-lg mb-6 border border-slate-800/60">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                  tab === 'login' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                  tab === 'register' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Onboard Company
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Company Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Builders Corp"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. builder@apex.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                  {tab === 'login' && (
                    <a href="#" className="text-xs text-brand-400 hover:text-brand-300 font-medium">Forgot?</a>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-50 text-sm font-bold text-white rounded-xl shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 group transition-all"
              >
                {loading ? 'Processing...' : tab === 'login' ? 'Sign In to Workspace' : 'Initialize Enterprise Account'}
                {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
              </button>
            </form>
          </div>

          {/* Quick Demo Logins Section */}
          <div className="mt-8 pt-8 border-t border-slate-800/60">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-brand-500" /> Demo Quick-Login Portals
            </h3>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleQuickLogin('builder@apex.com', 'OWNER')}
                disabled={loading}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-left text-xs text-slate-300 hover:border-brand-500 transition-all hover:bg-slate-900 group"
              >
                <div>
                  <div className="font-bold text-white group-hover:text-brand-400 transition-colors">Builder Portal</div>
                  <div className="text-[10px] text-slate-500">Rajesh S (Full Access)</div>
                </div>
                <HardHat className="w-4 h-4 text-brand-500 opacity-60" />
              </button>

              <button
                onClick={() => handleQuickLogin('engineer@apex.com', 'SITE_ENGINEER')}
                disabled={loading}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-left text-xs text-slate-300 hover:border-accent-cyan transition-all hover:bg-slate-900 group"
              >
                <div>
                  <div className="font-bold text-white group-hover:text-accent-cyan transition-colors">Site Engineer</div>
                  <div className="text-[10px] text-slate-500">Arun P (Daily Logs)</div>
                </div>
                <Activity className="w-4 h-4 text-accent-cyan opacity-60" />
              </button>

              <button
                onClick={() => handleQuickLogin('architect@apex.com', 'ARCHITECT')}
                disabled={loading}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-left text-xs text-slate-300 hover:border-accent-violet transition-all hover:bg-slate-900 group"
              >
                <div>
                  <div className="font-bold text-white group-hover:text-accent-violet transition-colors">Architect Portal</div>
                  <div className="text-[10px] text-slate-500">Priya I (Blueprints)</div>
                </div>
                <Building2 className="w-4 h-4 text-accent-violet opacity-60" />
              </button>

              <button
                onClick={() => handleQuickLogin('client@client.com', 'CLIENT')}
                disabled={loading}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-left text-xs text-slate-300 hover:border-accent-emerald transition-all hover:bg-slate-900 group"
              >
                <div>
                  <div className="font-bold text-white group-hover:text-accent-emerald transition-colors">Client Portal</div>
                  <div className="text-[10px] text-slate-500">Aditya B (Read Only)</div>
                </div>
                <Users2 className="w-4 h-4 text-accent-emerald opacity-60" />
              </button>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
