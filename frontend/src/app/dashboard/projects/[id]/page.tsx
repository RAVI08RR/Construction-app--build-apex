'use client';

import React, { useState, useEffect, use } from 'react';
import { useDashboard } from '../../DashboardContext';
import { api } from '@/utils/api';
import {
  Calendar,
  Layers,
  Coins,
  CheckCircle2,
  HardHat,
  MessageSquare,
  AlertTriangle,
  Play,
  Check,
  Send,
  Plus,
  X,
  Camera,
  Sun,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Params {
  id: string;
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.id;
  const { activeRole, refreshTrigger, triggerRefresh } = useDashboard();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'MILESTONES' | 'TASKS' | 'REPORTS'>('MILESTONES');

  // Load project details
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Task creation/detail state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
  const [newTaskAssignee, setNewTaskAssignee] = useState('user-engineer');
  const [newTaskMilestone, setNewTaskMilestone] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-06-25');
  const [taskDetailModal, setTaskDetailModal] = useState<any>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Daily Site Report state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportWork, setReportWork] = useState('');
  const [reportLabour, setReportLabour] = useState(25);
  const [reportWeather, setReportWeather] = useState('Sunny - 32°C');
  const [reportRemarks, setReportRemarks] = useState('');
  const [reportPhotos, setReportPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const loadProjectData = async () => {
      setLoading(true);
      const projRes = await api.get<any>(`/projects/${projectId}`);
      if (projRes.data) {
        setProject(projRes.data);
      } else {
        // Fallback mock projects details
        setProject({
          id: projectId,
          name: projectId === 'project-1' ? 'Luxury Villa - Sector 54' : 'Greenwood Commercial Complex',
          description: 'A structural landmark enterprise construction project.',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          budget: 50000000,
          status: 'ACTIVE',
          milestones: [
            { id: 'ms-1', name: 'Excavation & Foundation', progress: 100, dueDate: '2026-02-15' },
            { id: 'ms-2', name: 'Superstructure Framework', progress: 75, dueDate: '2026-06-30' },
            { id: 'ms-3', name: 'Brickwork & Plastering', progress: 30, dueDate: '2026-09-15' },
            { id: 'ms-4', name: 'Electrical & Plumbing', progress: 0, dueDate: '2026-10-31' },
          ],
          members: [
            { role: 'SITE_ENGINEER', user: { name: 'Arun Patel' } },
            { role: 'ARCHITECT', user: { name: 'Priya Iyer' } },
          ],
        });
      }

      // Load tasks
      const tasksRes = await api.get<any[]>(`/tasks?projectId=${projectId}`);
      if (tasksRes.data) {
        setTasks(tasksRes.data);
      } else {
        // Mock fallback tasks
        setTasks([
          { id: 'task-1', title: 'Cast First Floor Slab', description: 'Pouring cement roof reinforcement.', status: 'IN_PROGRESS', priority: 'HIGH', assignee: { name: 'Arun Patel' }, milestoneId: 'ms-2' },
          { id: 'task-2', title: 'Assemble Steel Rebars', description: 'Rebar pillar reinforcement layouts.', status: 'COMPLETED', priority: 'CRITICAL', assignee: { name: 'Sunil Verma' }, milestoneId: 'ms-2' },
          { id: 'task-4', title: 'Validate Floor Alignments', description: 'Laser alignment checking.', status: 'DELAYED', priority: 'HIGH', assignee: { name: 'Priya Iyer' }, milestoneId: 'ms-2' },
        ]);
      }

      // Load Site Reports
      const reportsRes = await api.get<any[]>(`/reports?projectId=${projectId}`);
      if (reportsRes.data) {
        setReports(reportsRes.data);
      } else {
        // Mock fallback reports
        setReports([
          {
            id: 'report-1',
            reportDate: '2026-06-19',
            workCompleted: 'Cast columns for floor 1. Brickwork completed on North face.',
            labourCount: 22,
            weather: 'Sunny - 32°C',
            remarks: 'Cement supply arrived successfully.',
            photos: [{ id: 'ph-1', photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80', caption: 'Floor 1 columns' }],
            submittedBy: { name: 'Arun Patel' },
          },
        ]);
      }
      setLoading(false);
    };

    loadProjectData();
  }, [projectId, refreshTrigger]);

  if (loading || !project) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 shimmer rounded"></div>
        <div className="h-64 shimmer rounded-2xl"></div>
      </div>
    );
  }

  // Handle task status updates
  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    const res = await api.patch(`/tasks/${taskId}`, { status: newStatus });
    if (res.data) {
      if (newStatus === 'COMPLETED') {
        confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } });
      }
      triggerRefresh();
      if (taskDetailModal && taskDetailModal.id === taskId) {
        setTaskDetailModal({ ...taskDetailModal, status: newStatus });
      }
    } else {
      // Local fallback edit
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      if (newStatus === 'COMPLETED') {
        confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } });
      }
      if (taskDetailModal && taskDetailModal.id === taskId) {
        setTaskDetailModal({ ...taskDetailModal, status: newStatus });
      }
    }
  };

  // Submit comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const res = await api.post(`/tasks/${taskDetailModal.id}/comments`, { content: newCommentText });
    if (res.data) {
      setNewCommentText('');
      // Reload task detail
      const updated = await api.get<any>(`/tasks/${taskDetailModal.id}`);
      if (updated.data) {
        setTaskDetailModal(updated.data);
      }
      triggerRefresh();
    } else {
      // Local fallback
      const mockComment = {
        id: `c-local-${Date.now()}`,
        content: newCommentText,
        createdAt: new Date().toISOString(),
        user: { name: 'You' }
      };
      setTaskDetailModal({
        ...taskDetailModal,
        comments: [...(taskDetailModal.comments || []), mockComment]
      });
      setNewCommentText('');
    }
  };

  // Submit task creation
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      title: newTaskTitle,
      description: newTaskDesc,
      projectId,
      milestoneId: newTaskMilestone || undefined,
      priority: newTaskPriority,
      assigneeId: newTaskAssignee,
      dueDate: newTaskDueDate,
    };

    const res = await api.post('/tasks', body);
    if (res.data) {
      setNewTaskTitle('');
      setNewTaskDesc('');
      setTaskModalOpen(false);
      triggerRefresh();
    } else {
      // Local fallback
      const localTask = {
        id: `task-${Date.now()}`,
        ...body,
        status: 'PENDING',
        assignee: { name: newTaskAssignee === 'user-engineer' ? 'Arun Patel' : 'Sunil Verma' }
      };
      setTasks(prev => [localTask, ...prev]);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setTaskModalOpen(false);
    }
  };

  // Simulate AWS S3 direct upload sequence
  const handleUploadPhoto = async () => {
    setUploadingPhoto(true);
    // 1. Fetch S3 Presigned Upload config
    const res = await api.post<{ uploadUrl: string; finalFileUrl: string; key: string }>('/uploads/presigned-url', {
      fileName: 'site-progress.jpg',
      mimeType: 'image/jpeg',
      projectId,
    });

    if (res.data) {
      console.log(`Sending PUT request to S3 Presigned URL: ${res.data.uploadUrl}`);
      // Simulate network wait of direct upload
      setTimeout(() => {
        setReportPhotos(prev => [...prev, res.data!.finalFileUrl]);
        setUploadingPhoto(false);
      }, 1200);
    } else {
      // Offline fallback
      setTimeout(() => {
        setReportPhotos(prev => [...prev, 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80']);
        setUploadingPhoto(false);
      }, 800);
    }
  };

  // Submit daily report
  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      projectId,
      reportDate: new Date().toISOString().split('T')[0],
      workCompleted: reportWork,
      labourCount: Number(reportLabour),
      weather: reportWeather,
      remarks: reportRemarks,
      photos: reportPhotos,
    };

    const res = await api.post('/reports', body);
    if (res.data) {
      setReportWork('');
      setReportRemarks('');
      setReportPhotos([]);
      setReportModalOpen(false);
      triggerRefresh();
    } else {
      // Local fallback
      const localReport = {
        id: `report-${Date.now()}`,
        ...body,
        photos: reportPhotos.map((url, idx) => ({ id: `ph-${idx}`, photoUrl: url })),
        submittedBy: { name: 'Arun Patel' }
      };
      setReports(prev => [localReport, ...prev]);
      setReportWork('');
      setReportRemarks('');
      setReportPhotos([]);
      setReportModalOpen(false);
    }
  };

  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'CRITICAL': return 'bg-accent-rose/10 text-accent-rose border-accent-rose/25';
      case 'HIGH': return 'bg-brand-500/10 text-brand-500 border-brand-500/25';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/25';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'border-l-accent-emerald';
      case 'IN_PROGRESS': return 'border-l-accent-blue';
      case 'DELAYED': return 'border-l-accent-rose';
      default: return 'border-l-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Project Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-[70px] pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl md:text-2xl font-display font-extrabold tracking-tight">{project.name}</h1>
              <span className="px-2.5 py-0.5 text-[9px] font-extrabold border border-accent-blue/30 bg-accent-blue/5 text-accent-blue rounded-full tracking-wider uppercase leading-none">
                {project.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">{project.description}</p>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-4 shrink-0">
            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-850">
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Start Date</span>
              <span className="text-xs font-bold">{new Date(project.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-850">
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Project Budget</span>
              <span className="text-xs font-extrabold text-brand-500">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(project.budget)}
              </span>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-4 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Onsite Scope:</span>
          <div className="flex flex-wrap gap-2">
            {project.members && project.members.map((member: any, i: number) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-lg font-semibold text-slate-600 dark:text-slate-350">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                {member.user?.name || 'User'} ({member.role.replace('_', ' ')})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('MILESTONES')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'MILESTONES' ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Timeline & Milestones
        </button>
        <button
          onClick={() => setActiveTab('TASKS')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'TASKS' ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Task Kanban Board ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
            activeTab === 'REPORTS' ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Daily Site Logs ({reports.length})
        </button>
      </div>

      {/* TAB 1: MILESTONES */}
      {activeTab === 'MILESTONES' && (
        <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Execution Roadmap</h2>
          <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 ml-3 space-y-8">
            {project.milestones && project.milestones.map((m: any) => (
              <div key={m.id} className="relative">
                {/* Node icon */}
                <span className={`absolute -left-[35px] top-1.5 p-1 rounded-full border bg-white dark:bg-slate-900 ${
                  m.progress === 100 ? 'text-accent-emerald border-accent-emerald/40' : 'text-brand-500 border-brand-500/40'
                }`}>
                  {m.progress === 100 ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4 fill-brand-500/20" />}
                </span>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Due: {new Date(m.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-500 h-2 rounded-full transition-all"
                        style={{ width: `${m.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold w-10 text-right">{m.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TASKS KANBAN */}
      {activeTab === 'TASKS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Kanban View</span>
            {activeRole !== 'CLIENT' && (
              <button
                onClick={() => setTaskModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 font-bold text-white rounded-lg shadow-sm text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" /> Assign Task
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {(['PENDING', 'IN_PROGRESS', 'DELAYED', 'COMPLETED'] as const).map(status => {
              const filtered = tasks.filter(t => t.status === status);
              return (
                <div key={status} className="flex flex-col bg-white/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 min-h-[400px]">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-150 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{status.replace('_', ' ')}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 rounded-md">
                      {filtered.length}
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {filtered.map(task => (
                      <div
                        key={task.id}
                        onClick={async () => {
                          // Fetch task details (including comments)
                          const detailRes = await api.get<any>(`/tasks/${task.id}`);
                          if (detailRes.data) setTaskDetailModal(detailRes.data);
                          else setTaskDetailModal(task);
                        }}
                        className={`p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-xl border-l-4 ${getTaskStatusColor(status)} hover:border-brand-500/40 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm`}
                      >
                        <h4 className="text-xs font-bold line-clamp-1">{task.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
                        
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                          <span className={`px-2 py-0.5 text-[8px] border font-extrabold rounded-md ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold">{task.assignee?.name || 'Unassigned'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DAILY SITE LOGS */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Site Logs History</span>
            {/* Site Engineer, Builder or PM can submit daily reports */}
            {activeRole !== 'CLIENT' && (
              <button
                onClick={() => setReportModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 font-bold text-white rounded-lg shadow-sm text-[11px]"
              >
                <Camera className="w-3.5 h-3.5" /> Log Daily Site Progress
              </button>
            )}
          </div>

          <div className="space-y-6">
            {reports.map(report => (
              <div key={report.id} className="glass-panel rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4">
                {/* Submit info */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-accent-emerald"></span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Log Date: {new Date(report.reportDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Submitted by: {report.submittedBy?.name || 'Site Engineer'}
                  </div>
                </div>

                {/* Details layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Work Completed</span>
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-350">{report.workCompleted}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Labour Headcount</span>
                        <div className="text-xs font-bold flex items-center gap-1">
                          <HardHat className="w-4 h-4 text-brand-500" /> {report.labourCount} Workers
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Weather Conditions</span>
                        <div className="text-xs font-bold flex items-center gap-1">
                          <Sun className="w-4 h-4 text-yellow-500" /> {report.weather}
                        </div>
                      </div>
                    </div>

                    {report.remarks && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Manager Remarks</span>
                        <p className="text-xs italic text-slate-500">{report.remarks}</p>
                      </div>
                    )}
                  </div>

                  {/* Photo attachments */}
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Progress Snapshots</span>
                    <div className="grid grid-cols-1 gap-2">
                      {report.photos && report.photos.map((ph: any) => (
                        <div key={ph.id} className="relative group overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-video">
                          <img
                            src={ph.photoUrl}
                            alt="Progress snapshot"
                            className="object-cover w-full h-full opacity-90 group-hover:scale-105 transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TASK DETAIL MODAL PANEL */}
      {taskDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Task details</span>
                <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white leading-tight mt-0.5">{taskDetailModal.title}</h3>
              </div>
              <button
                onClick={() => setTaskDetailModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
              
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Description</span>
                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">{taskDetailModal.description || 'No description provided.'}</p>
              </div>

              {/* Status and Action bar */}
              <div className="grid grid-cols-2 gap-4 py-3.5 border-y border-slate-100 dark:border-slate-800/80">
                
                {/* Change Status */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Status</span>
                  {activeRole === 'CLIENT' ? (
                    <span className="px-2 py-0.5 text-xs font-bold border rounded bg-slate-100 dark:bg-slate-950">{taskDetailModal.status}</span>
                  ) : (
                    <select
                      value={taskDetailModal.status}
                      onChange={e => handleUpdateTaskStatus(taskDetailModal.id, e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded text-xs font-bold focus:outline-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DELAYED">Delayed</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Assignee</span>
                  <span className="text-xs font-bold text-slate-850 dark:text-slate-250 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
                    {taskDetailModal.assignee?.name || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Comments Feed */}
              <div className="space-y-3">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Communication History</span>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {(!taskDetailModal.comments || taskDetailModal.comments.length === 0) ? (
                    <div className="text-xs text-slate-500 italic py-2">No comments have been posted yet.</div>
                  ) : (
                    taskDetailModal.comments.map((c: any) => (
                      <div key={c.id} className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200/50 dark:border-slate-850 text-xs">
                        <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400 font-bold">
                          <span>{c.user?.name || 'Engineer'}</span>
                          <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-650 dark:text-slate-350">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment input */}
                {activeRole !== 'CLIENT' && (
                  <form onSubmit={handlePostComment} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <input
                      type="text"
                      placeholder="Ask for site update or notify delay..."
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center justify-center transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ASSIGN TASK MODAL */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">Assign New Task</h3>
              <button onClick={() => setTaskModalOpen(false)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cast floor column rebar grid"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details of structural layout..."
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={e => setNewTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="user-engineer">Arun Patel (Site Eng)</option>
                    <option value="user-contractor">Sunil Verma (Contractor)</option>
                    <option value="user-architect">Priya Iyer (Architect)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Milestone Link</label>
                  <select
                    value={newTaskMilestone}
                    onChange={e => setNewTaskMilestone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none"
                  >
                    <option value="">Unlinked</option>
                    {project.milestones && project.milestones.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setTaskModalOpen(false)} className="text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-lg text-xs font-bold shadow-md shadow-brand-500/10">Initialize Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DAILY REPORT MODAL LOG */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Camera className="w-5 h-5 text-brand-500" /> Log Daily Site Progress
              </h3>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateReport} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Work Completed Today</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify cast grids, concrete batches poured, bricks laid..."
                  value={reportWork}
                  onChange={e => setReportWork(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Labour Count Present</label>
                  <input
                    type="number"
                    required
                    value={reportLabour}
                    onChange={e => setReportLabour(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Weather Condition</label>
                  <input
                    type="text"
                    required
                    value={reportWeather}
                    onChange={e => setReportWeather(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Remarks / Material Received</label>
                <input
                  type="text"
                  placeholder="e.g. 500 bags of cement delivered and stacked in warehouse."
                  value={reportRemarks}
                  onChange={e => setReportRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs focus:outline-none"
                />
              </div>

              {/* Simulated S3 Upload Section */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Upload Progress Photos</label>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleUploadPhoto}
                    disabled={uploadingPhoto}
                    className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 rounded-lg text-xs font-semibold hover:border-brand-500/40 hover:text-slate-850 dark:hover:text-slate-200 flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {uploadingPhoto ? 'Generating Presigned URL...' : 'Simulate S3 Upload'}
                    <Camera className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex gap-2">
                    {reportPhotos.map((url, i) => (
                      <div key={i} className="h-10 w-10 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden relative">
                        <img src={url} alt="attached site progress" className="object-cover h-full w-full" />
                      </div>
                    ))}
                  </div>
                </div>
                {uploadingPhoto && (
                  <span className="block text-[10px] text-slate-400 mt-1.5 italic font-medium">
                    Console Logs: Requesting presigned URL... Direct PUT upload to bucket triggered... 200 OK.
                  </span>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setReportModalOpen(false)} className="text-xs font-bold text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded-lg text-xs font-bold shadow-md shadow-brand-500/10">Log Site Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
