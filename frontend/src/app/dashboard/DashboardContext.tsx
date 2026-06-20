'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';

interface DashboardContextType {
  user: any;
  activeRole: string;
  setActiveRole: (role: string) => void;
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  projects: any[];
  setProjects: (projects: any[]) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
  loading: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeRole, setActiveRoleState] = useState<string>('OWNER');
  const [activeProjectId, setActiveProjectId] = useState<string>('project-1');
  const [projects, setProjects] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const setActiveRole = (role: string) => {
    api.setActiveRole(role);
    setActiveRoleState(role);
    triggerRefresh();
  };

  useEffect(() => {
    const token = api.getToken();
    const currentUser = api.getUser();
    const savedRole = api.getActiveRole();

    if (!token || !currentUser) {
      router.push('/');
      return;
    }

    setUser(currentUser);
    if (savedRole) {
      setActiveRoleState(savedRole);
    } else {
      setActiveRoleState(currentUser.role === 'OWNER' ? 'OWNER' : 'PROJECT_MANAGER');
    }
    setLoading(false);
  }, [router]);

  // Load projects list
  useEffect(() => {
    if (user) {
      const fetchProjects = async () => {
        const res = await api.get<any[]>('/projects');
        if (res.data && res.data.length > 0) {
          setProjects(res.data);
          // Set first project as active if current active is not in the list
          const activeExists = res.data.some(p => p.id === activeProjectId);
          if (!activeExists) {
            setActiveProjectId(res.data[0].id);
          }
        } else {
          // Local fallback seed if no projects loaded
          const mockProjects = [
            { id: 'project-1', name: 'Luxury Villa - Sector 54', budget: 50000000, status: 'ACTIVE' },
            { id: 'project-2', name: 'Greenwood Commercial Complex', budget: 150000000, status: 'PLANNING' },
            { id: 'project-3', name: 'Skyline Heights - Tower A', budget: 250000000, status: 'DELAYED' }
          ];
          setProjects(mockProjects);
        }
      };
      fetchProjects();
    }
  }, [user, refreshTrigger, activeProjectId]);

  return (
    <DashboardContext.Provider
      value={{
        user,
        activeRole,
        setActiveRole,
        activeProjectId,
        setActiveProjectId,
        projects,
        setProjects,
        refreshTrigger,
        triggerRefresh,
        loading,
      }}
    >
      {!loading && children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
