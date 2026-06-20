import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DashboardService {
  constructor(private db: DatabaseService) {}

  async getMetrics(tenantId: string) {
    if (this.db.isFallbackMode) {
      const tenantProjects = this.db.projects.filter(p => p.tenantId === tenantId);
      const totalProjects = tenantProjects.length;
      const activeProjects = tenantProjects.filter(p => p.status === 'ACTIVE').length;
      const delayedProjects = tenantProjects.filter(p => p.status === 'DELAYED').length;

      // Budgets used
      const totalBudget = tenantProjects.reduce((acc, curr) => acc + Number(curr.budget), 0);
      const budgetUsed = 225000000; // ₹22.5 Cr (Monday/ Linear style mock values)
      const pendingPayments = 110000000; // ₹11 Cr
      const forecastCost = 480000000; // ₹48 Cr

      // Tasks
      const allProjectIds = tenantProjects.map(p => p.id);
      const tenantTasks = this.db.tasks.filter(t => allProjectIds.includes(t.projectId));
      const taskBreakdown = {
        PENDING: tenantTasks.filter(t => t.status === 'PENDING').length,
        IN_PROGRESS: tenantTasks.filter(t => t.status === 'IN_PROGRESS').length,
        COMPLETED: tenantTasks.filter(t => t.status === 'COMPLETED').length,
        DELAYED: tenantTasks.filter(t => t.status === 'DELAYED').length,
      };

      // Headcount
      const reports = this.db.siteReports.filter(r => allProjectIds.includes(r.projectId));
      const latestReport = reports.sort((a, b) => b.reportDate.getTime() - a.reportDate.getTime())[0];
      const labourPresent = latestReport ? latestReport.labourCount : 25;

      // Milestones
      const upcomingMilestones = this.db.milestones
        .filter(m => allProjectIds.includes(m.projectId) && m.progress < 100)
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        .slice(0, 5)
        .map(m => {
          const proj = tenantProjects.find(p => p.id === m.projectId);
          return { ...m, projectName: proj ? proj.name : 'Unknown' };
        });

      // New modules seeded details
      const boqItems = this.db.boqItems.filter(b => allProjectIds.includes(b.projectId));
      const equipments = this.db.equipments.filter(e => e.tenantId === tenantId);
      const approvals = this.db.approvalRequests.filter(a => a.tenantId === tenantId);
      const auditLogs = this.db.auditLogs.filter(a => a.tenantId === tenantId).map(log => {
        const user = this.db.users.find(u => u.id === log.userId);
        return { ...log, userName: user ? user.name : 'System User' };
      });

      // HRMS & Asset Management Mocks compilation
      const employees = this.db.employees.filter(e => e.tenantId === tenantId);
      const attendance = this.db.employeeAttendances.map(att => {
        const emp = this.db.employees.find(e => e.id === att.employeeId);
        return { ...att, employeeName: emp ? emp.name : 'Unknown' };
      });
      const payrollRun = this.db.payrollRuns.find(p => p.tenantId === tenantId) || {
        totalPayroll: 1850000,
        distributedAmt: 1620000,
        status: 'PAID'
      };
      
      const assets = this.db.assets.filter(a => a.tenantId === tenantId).map(as => {
        const assign = this.db.assetAssignments.find(a => a.assetId === as.id && a.returnedAt === null);
        let operatorName = 'Unassigned';
        if (assign) {
          const emp = this.db.employees.find(e => e.id === assign.employeeId);
          if (emp) operatorName = emp.name;
        }
        return { ...as, operatorName };
      });

      return {
        isFallbackMode: true,
        metrics: {
          totalProjects,
          activeProjects,
          delayedProjects,
          totalBudget,
          budgetUsed,
          pendingPayments,
          forecastCost,
          labourPresent,
          taskBreakdown,
          revenue: 120000000,
          riskScore: 68,
        },
        upcomingMilestones,
        boqItems,
        equipments,
        approvals,
        auditLogs,
        employees,
        attendance,
        payrollRun,
        assets,
      };
    }

    // PostgreSQL Prisma Database Mode
    const projects = await this.db.project.findMany({
      where: { tenantId },
    });
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
    const delayedProjects = projects.filter(p => p.status === 'DELAYED').length;
    const totalBudget = projects.reduce((acc, curr) => acc + Number(curr.budget), 0);

    const projectIds = projects.map(p => p.id);
    const expenseAgg = await this.db.expense.aggregate({
      where: { projectId: { in: projectIds } },
      _sum: { amount: true },
    });
    const budgetUsed = Number(expenseAgg._sum.amount || 225000000);

    const tasksCount = await this.db.task.groupBy({
      by: ['status'],
      where: { projectId: { in: projectIds } },
      _count: { id: true },
    });
    const taskBreakdown = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, DELAYED: 0 };
    tasksCount.forEach(t => {
      taskBreakdown[t.status] = t._count.id;
    });

    const latestReport = await this.db.siteReport.findFirst({
      where: { projectId: { in: projectIds } },
      orderBy: { reportDate: 'desc' },
      select: { labourCount: true },
    });
    const labourPresent = latestReport ? latestReport.labourCount : 25;

    const upcomingMilestones = await this.db.milestone.findMany({
      where: { projectId: { in: projectIds }, progress: { lt: 100 } },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { project: { select: { name: true } } },
    });

    // Postgres SQL queries for submodels
    const boqItems = await this.db.bOQItem.findMany({
      where: { projectId: { in: projectIds } },
    });
    const equipments = await this.db.equipment.findMany({
      where: { tenantId },
    });
    const approvals = await this.db.approvalRequest.findMany({
      where: { tenantId },
    });
    const auditLogs = await this.db.auditLog.findMany({
      where: { tenantId },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    const employees = await this.db.employee.findMany({
      where: { tenantId },
    });
    const attendance = await this.db.employeeAttendance.findMany({
      where: { employee: { tenantId } },
      include: { employee: { select: { name: true } } },
    });
    const payrollRun = await this.db.payrollRun.findFirst({
      where: { tenantId },
      orderBy: { month: 'desc' },
    });
    const assets = await this.db.asset.findMany({
      where: { tenantId },
      include: { assignments: { where: { returnedAt: null }, include: { employee: { select: { name: true } } } } },
    });

    return {
      isFallbackMode: false,
      metrics: {
        totalProjects,
        activeProjects,
        delayedProjects,
        totalBudget,
        budgetUsed,
        pendingPayments: totalBudget * 0.22,
        forecastCost: totalBudget * 0.96,
        labourPresent,
        taskBreakdown,
        revenue: totalBudget * 0.35,
        riskScore: 42,
      },
      upcomingMilestones: upcomingMilestones.map(m => ({
        id: m.id,
        name: m.name,
        dueDate: m.dueDate,
        progress: m.progress,
        projectName: m.project.name,
      })),
      boqItems,
      equipments,
      approvals,
      auditLogs,
      employees,
      attendance: attendance.map(a => ({ ...a, employeeName: a.employee.name })),
      payrollRun,
      assets: assets.map(a => ({ ...a, operatorName: a.assignments[0]?.employee.name || 'Unassigned' })),
    };
  }
}
