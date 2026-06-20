import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const genId = () => Math.random().toString(36).slice(2, 10);

@Injectable()
export class HrmsService {
  constructor(private db: DatabaseService) {}

  // ---- ATTENDANCE ----
  getAttendance(tenantId: string) {
    if (this.db.isFallbackMode) {
      return this.db.employeeAttendances.map(att => {
        const emp = this.db.employees.find(e => e.id === att.employeeId);
        return { ...att, employeeName: emp?.name || 'Unknown', department: emp?.department || '' };
      });
    }
    return [];
  }

  checkIn(data: any) {
    if (this.db.isFallbackMode) {
      const newAttendance = {
        id: `att-${genId()}`,
        employeeId: data.employeeId,
        date: new Date(),
        checkIn: new Date(),
        checkOut: null,
        checkInLat: data.lat,
        checkInLng: data.lng,
        status: data.distanceMtrs <= 200 ? 'PRESENT' : 'ABSENT',
        distanceMtrs: data.distanceMtrs,
        isFraudFlag: data.distanceMtrs > 200,
        fraudRemarks: data.distanceMtrs > 200 ? `Check-in location ${(data.distanceMtrs / 1000).toFixed(1)}km away from geofence radius.` : null,
        selfieUrl: data.selfieUrl || null,
      };
      this.db.employeeAttendances.push(newAttendance);
      const emp = this.db.employees.find(e => e.id === data.employeeId);
      return { ...newAttendance, employeeName: emp?.name || 'Unknown' };
    }
    return { id: `att-${genId()}`, ...data };
  }

  // ---- PAYROLL ----
  getPayrollRuns(tenantId: string) {
    if (this.db.isFallbackMode) {
      const runs = this.db.payrollRuns.filter(p => p.tenantId === tenantId);
      return runs.map(run => ({
        ...run,
        payslips: this.db.payslips.filter(ps => ps.payrollRunId === run.id).map(ps => {
          const emp = this.db.employees.find(e => e.id === ps.employeeId);
          return { ...ps, employeeName: emp?.name || 'Unknown', designation: emp?.designation || '' };
        }),
      }));
    }
    return [];
  }

  runPayroll(data: any) {
    if (this.db.isFallbackMode) {
      const employees = this.db.employees.filter(e => e.tenantId === data.tenantId);
      const totalPayroll = employees.reduce((sum, e) => sum + (e.salaryBasic || 0) + (e.allowanceHRA || 0) + (e.allowanceMisc || 0), 0);
      const runId = `payroll-run-${genId()}`;
      const run = {
        id: runId,
        tenantId: data.tenantId,
        month: data.month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        totalPayroll,
        distributedAmt: 0,
        status: 'PENDING',
        createdAt: new Date(),
      };
      this.db.payrollRuns.push(run);

      // Auto-generate payslips
      employees.forEach(emp => {
        const deductPF = Math.round((emp.salaryBasic || 0) * 0.12);
        const deductESIC = Math.round((emp.salaryBasic || 0) * 0.0075);
        const net = (emp.salaryBasic || 0) + (emp.allowanceHRA || 0) + (emp.allowanceMisc || 0) - deductPF - deductESIC;
        this.db.payslips.push({
          id: `psl-${genId()}`,
          payrollRunId: runId,
          employeeId: emp.id,
          basicPaid: emp.salaryBasic || 0,
          hraPaid: emp.allowanceHRA || 0,
          bonusPaid: emp.allowanceMisc || 0,
          deductPF,
          deductESIC,
          netPaid: net,
          payslipUrl: '#',
        });
      });
      return { ...run, payslips: this.db.payslips.filter(ps => ps.payrollRunId === runId) };
    }
    return { id: genId(), ...data };
  }

  approvePayroll(runId: string, tenantId: string) {
    if (this.db.isFallbackMode) {
      const idx = this.db.payrollRuns.findIndex(p => p.id === runId && p.tenantId === tenantId);
      if (idx === -1) return { error: 'Payroll run not found' };
      this.db.payrollRuns[idx].status = 'APPROVED';
      this.db.payrollRuns[idx].distributedAmt = this.db.payrollRuns[idx].totalPayroll;
      return this.db.payrollRuns[idx];
    }
    return { id: runId, status: 'APPROVED' };
  }

  getPayslips(runId: string) {
    if (this.db.isFallbackMode) {
      return this.db.payslips.filter(ps => ps.payrollRunId === runId).map(ps => {
        const emp = this.db.employees.find(e => e.id === ps.employeeId);
        return { ...ps, employeeName: emp?.name || 'Unknown', designation: emp?.designation || '' };
      });
    }
    return [];
  }

  // ---- LABOUR ----
  getLabour(tenantId: string) {
    if (this.db.isFallbackMode) {
      return this.db.siteReports.map(r => ({
        id: `labour-${r.id}`,
        projectId: r.projectId,
        date: r.reportDate,
        labourCount: r.labourCount,
        supervisorId: r.submittedById,
        supervisorName: (this.db.users.find(u => u.id === r.submittedById) || { name: 'Unknown' }).name,
        category: 'GENERAL',
        shift: 'DAY',
        remarks: r.remarks,
      }));
    }
    return [];
  }

  logLabour(data: any) {
    if (this.db.isFallbackMode) {
      return { id: `labour-${genId()}`, ...data, createdAt: new Date() };
    }
    return {};
  }
}
