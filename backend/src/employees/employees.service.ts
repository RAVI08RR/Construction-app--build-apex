import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const genId = () => Math.random().toString(36).slice(2, 10);

@Injectable()
export class EmployeesService {
  constructor(private db: DatabaseService) {}

  findAll(tenantId: string, dept?: string) {
    if (this.db.isFallbackMode) {
      let emps = this.db.employees.filter(e => e.tenantId === tenantId);
      if (dept) emps = emps.filter(e => e.department === dept);
      return emps;
    }
    // PostgreSQL path - dynamically access to avoid TS errors with ungenerated Prisma client
    const prismaAny = this.db as any;
    if (prismaAny.employee) {
      return prismaAny.employee.findMany({ where: { tenantId, ...(dept ? { department: dept } : {}) } });
    }
    return [];
  }

  findOne(id: string, tenantId: string) {
    if (this.db.isFallbackMode) {
      const emp = this.db.employees.find(e => e.id === id && e.tenantId === tenantId);
      if (!emp) throw new NotFoundException('Employee not found');
      return emp;
    }
    const prismaAny = this.db as any;
    return prismaAny.employee?.findFirst({ where: { id, tenantId } }) ?? null;
  }

  create(data: any) {
    if (this.db.isFallbackMode) {
      const newEmp = {
        id: `emp-${genId()}`,
        employeeId: `EMP-${new Date().getFullYear()}-${String(this.db.employees.length + 1).padStart(3, '0')}`,
        ...data,
        status: data.status || 'ACTIVE',
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.db.employees.push(newEmp);
      return newEmp;
    }
    const prismaAny = this.db as any;
    return prismaAny.employee?.create({ data }) ?? {};
  }

  update(id: string, data: any, tenantId: string) {
    if (this.db.isFallbackMode) {
      const idx = this.db.employees.findIndex(e => e.id === id && e.tenantId === tenantId);
      if (idx === -1) throw new NotFoundException('Employee not found');
      this.db.employees[idx] = { ...this.db.employees[idx], ...data, updatedAt: new Date() };
      return this.db.employees[idx];
    }
    const prismaAny = this.db as any;
    return prismaAny.employee?.update({ where: { id }, data }) ?? {};
  }

  remove(id: string, tenantId: string) {
    if (this.db.isFallbackMode) {
      const idx = this.db.employees.findIndex(e => e.id === id && e.tenantId === tenantId);
      if (idx === -1) throw new NotFoundException('Employee not found');
      const removed = this.db.employees[idx];
      this.db.employees.splice(idx, 1);
      return { message: 'Employee deleted', id: removed.id };
    }
    const prismaAny = this.db as any;
    return prismaAny.employee?.delete({ where: { id } }) ?? {};
  }
}
