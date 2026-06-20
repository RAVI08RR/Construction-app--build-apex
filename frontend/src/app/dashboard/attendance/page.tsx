'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../DashboardContext';
import { api } from '@/utils/api';
import { Calendar, Smartphone, ShieldAlert, MapPin, CheckCircle, X, User, AlertTriangle, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AttendancePage() {
  const { activeProjectId, activeRole } = useDashboard();
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [simulateLat, setSimulateLat] = useState(28.6142);
  const [simulateLng, setSimulateLng] = useState(77.2088);
  const [selectedLocation, setSelectedLocation] = useState<'SITE' | 'REMOTE'>('SITE');
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState<string | null>(null);
  const [distanceCalculated, setDistanceCalculated] = useState(42);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [attRes, empRes, metricsRes] = await Promise.all([
      api.get<any[]>('/hrms/attendance'),
      api.get<any[]>('/employees'),
      api.get<any>('/dashboard/metrics'),
    ]);

    if (attRes.data && Array.isArray(attRes.data)) {
      setAttendanceLogs(attRes.data);
    } else {
      setAttendanceLogs(metricsRes.data?.attendance || []);
    }

    if (empRes.data && Array.isArray(empRes.data)) {
      setEmployees(empRes.data);
      if (empRes.data.length > 0) setSelectedEmployee(empRes.data[0].id);
    } else {
      setEmployees(metricsRes.data?.employees || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData, activeProjectId]);

  const handleLocationSimulation = (loc: 'SITE' | 'REMOTE') => {
    setSelectedLocation(loc);
    if (loc === 'SITE') { setSimulateLat(28.6142); setSimulateLng(77.2088); setDistanceCalculated(42); }
    else { setSimulateLat(28.5355); setSimulateLng(77.3910); setDistanceCalculated(2250); }
  };

  const handleGeoCheckinSubmit = async () => {
    if (distanceCalculated > 200) {
      alert('ATTENDANCE BLOCKED: Geofence radius mismatch. You must check-in within 200 meters of the construction site.');
      return;
    }
    setCheckinSuccess('VERIFYING...');
    
    const res = await api.post('/hrms/attendance', {
      employeeId: selectedEmployee,
      lat: simulateLat,
      lng: simulateLng,
      distanceMtrs: distanceCalculated,
    });

    setTimeout(() => {
      confetti({ particleCount: 60, spread: 40 });
      setCheckinSuccess('SUCCESSFUL');
      const emp = employees.find(e => e.id === selectedEmployee);
      const mockRecord = {
        id: `att-${Date.now()}`,
        employeeName: emp?.name || 'Employee',
        department: emp?.department || '',
        date: new Date().toISOString(),
        checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'PRESENT',
        distanceMtrs: distanceCalculated,
        isFraudFlag: false,
      };
      setAttendanceLogs(prev => [mockRecord, ...prev]);
    }, 1500);
  };

  const todayLogs = attendanceLogs.filter(log => {
    const logDate = new Date(log.date);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  });

  const fraudLogs = attendanceLogs.filter(log => log.isFraudFlag);
  const presentToday = todayLogs.filter(log => log.status === 'PRESENT' && !log.isFraudFlag).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-400">Loading attendance center...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-500" /> Geo Attendance
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">GPS-enforced attendance with geofence radius check and selfie biometric verification.</p>
        </div>
      </div>

      {/* Fraud Alert Banner */}
      {fraudLogs.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 rounded-2xl">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <div className="text-xs font-bold text-red-600 dark:text-red-400">🚨 Fraud Alert — {fraudLogs.length} Suspicious Check-In(s) Detected</div>
            <div className="text-[10px] text-red-500/80 mt-0.5">{fraudLogs.map(f => f.employeeName).join(', ')} — Location outside geofence boundary.</div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: attendanceLogs.length, color: 'text-green-500' },
          { label: 'Present Today', value: presentToday, color: 'text-emerald-500' },
          { label: 'Fraud Alerts', value: fraudLogs.length, color: 'text-red-500' },
          { label: 'Employees', value: employees.length, color: 'text-blue-500' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
            <div className={`text-2xl font-extrabold font-display ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mobile Check-In Simulator */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-green-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Mobile Check-In Portal</h3>
            </div>
            <span className="text-[9px] bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded font-bold uppercase">GPS Audited</span>
          </div>

          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-2xl text-xs font-bold">
            {/* Employee Selector */}
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1.5 uppercase tracking-wider">Check-in as:</label>
              <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none cursor-pointer">
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.designation}</option>)}
              </select>
            </div>

            <div className="flex justify-between border-b dark:border-slate-800 pb-2 text-[10px] text-slate-400 font-semibold">
              <span>Site Coordinates:</span>
              <span>28.6139° N, 77.2090° E</span>
            </div>
            <div className="flex justify-between border-b dark:border-slate-800 pb-2">
              <span>Selected Coordinates:</span>
              <span className="text-green-500">{simulateLat.toFixed(4)}° N, {simulateLng.toFixed(4)}° E</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Location Simulation:</span>
              <div className="flex gap-1.5">
                <button onClick={() => handleLocationSimulation('SITE')} className={`px-2 py-1 border rounded text-[10px] uppercase font-bold cursor-pointer ${selectedLocation === 'SITE' ? 'bg-green-500 text-white border-green-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>On-Site</button>
                <button onClick={() => handleLocationSimulation('REMOTE')} className={`px-2 py-1 border rounded text-[10px] uppercase font-bold cursor-pointer ${selectedLocation === 'REMOTE' ? 'bg-red-500 text-white border-red-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>2.2km Away</button>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${distanceCalculated <= 200 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
              <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /><span>GPS Distance: {distanceCalculated}m from site</span></div>
              <span className="font-bold">{distanceCalculated <= 200 ? 'IN RANGE ✓' : 'BLOCKED ✗'}</span>
            </div>

            <div className="pt-1">
              <span className="block text-[10px] text-slate-400 font-semibold mb-1.5 uppercase">Selfie Biometric Verification</span>
              <button type="button" onClick={() => setSelfieCaptured(true)}
                className={`w-full py-3.5 border border-dashed rounded-xl flex items-center justify-center gap-2 cursor-pointer font-bold transition-all ${selfieCaptured ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-500'}`}>
                {selfieCaptured ? <><CheckCircle className="w-4 h-4" /> Selfie captured & verified</> : <><Smartphone className="w-4 h-4" /> Verify Biometric Face ID</>}
              </button>
            </div>

            <button onClick={handleGeoCheckinSubmit} disabled={!selfieCaptured || checkinSuccess === 'VERIFYING...' || checkinSuccess === 'SUCCESSFUL'}
              className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-green-500/15 cursor-pointer mt-2">
              {checkinSuccess || 'Verify GPS Check-In'}
            </button>
          </div>
        </div>

        {/* Attendance Logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Attendance Shift Logs</h3>
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {attendanceLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold">No attendance records yet. Use the simulator to check-in.</div>
              ) : attendanceLogs.map(log => (
                <div key={log.id} className={`p-3 border rounded-2xl flex items-start justify-between transition-colors ${log.isFraudFlag ? 'border-red-500/30 bg-red-50 dark:bg-red-500/5' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${log.isFraudFlag ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <div>
                      <div className={`text-xs font-extrabold flex items-center gap-1.5 ${log.isFraudFlag ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                        {log.employeeName}
                        {log.isFraudFlag && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-extrabold rounded uppercase">Spoof Alert</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {log.department && <span className="mr-2">{log.department} •</span>}
                        Check-In: {typeof log.checkIn === 'string' && log.checkIn.includes(':') && !log.checkIn.includes('T') ? log.checkIn : new Date(log.checkIn || log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •
                        Date: {new Date(log.date).toLocaleDateString()}
                      </div>
                      {log.isFraudFlag && <span className="text-[9px] text-red-400 font-medium block mt-0.5">⚠ {log.fraudRemarks}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className={`text-[9px] font-bold ${log.distanceMtrs <= 200 ? 'text-green-500' : 'text-red-500'}`}>{log.distanceMtrs}m</span>
                    <div className="text-[9px] text-slate-400 mt-0.5">{log.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
