import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const genId = () => Math.random().toString(36).slice(2, 10);

@Injectable()
export class AssetsService {
  constructor(private db: DatabaseService) {}

  findAll(tenantId: string) {
    if (this.db.isFallbackMode) {
      return this.db.assets.filter(a => a.tenantId === tenantId).map(asset => {
        const assignment = this.db.assetAssignments.find(a => a.assetId === asset.id && !a.returnedAt);
        let operatorName = 'Unassigned';
        if (assignment) {
          const emp = this.db.employees.find(e => e.id === assignment.employeeId);
          operatorName = emp?.name || 'Unknown';
        }
        return { ...asset, operatorName, currentAssignment: assignment || null };
      });
    }
    return [];
  }

  create(data: any) {
    if (this.db.isFallbackMode) {
      const assetCode = `AST-${(data.category || 'GEN').slice(0, 3).toUpperCase()}-${String(this.db.assets.length + 1).padStart(3, '0')}`;
      const newAsset = {
        id: `as-${genId()}`,
        assetId: data.assetId || assetCode,
        ...data,
        status: data.status || 'AVAILABLE',
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.assetId || assetCode}`,
        createdAt: new Date(),
      };
      this.db.assets.push(newAsset);
      return newAsset;
    }
    return {};
  }

  update(id: string, data: any, tenantId: string) {
    if (this.db.isFallbackMode) {
      const idx = this.db.assets.findIndex(a => a.id === id && a.tenantId === tenantId);
      if (idx === -1) throw new NotFoundException('Asset not found');
      this.db.assets[idx] = { ...this.db.assets[idx], ...data, updatedAt: new Date() };
      return this.db.assets[idx];
    }
    return {};
  }

  remove(id: string, tenantId: string) {
    if (this.db.isFallbackMode) {
      const idx = this.db.assets.findIndex(a => a.id === id && a.tenantId === tenantId);
      if (idx === -1) throw new NotFoundException('Asset not found');
      const removed = this.db.assets.splice(idx, 1)[0];
      return { message: 'Asset deleted', id: removed.id };
    }
    return {};
  }

  assignAsset(assetId: string, employeeId: string, tenantId: string) {
    if (this.db.isFallbackMode) {
      // Close any existing open assignments
      this.db.assetAssignments = this.db.assetAssignments.map(a =>
        a.assetId === assetId && !a.returnedAt ? { ...a, returnedAt: new Date() } : a
      );
      const assignment = {
        id: `asg-${genId()}`,
        assetId,
        employeeId,
        assignedAt: new Date(),
        returnedAt: null,
        remarks: 'Assigned via dashboard',
      };
      this.db.assetAssignments.push(assignment);
      const assetIdx = this.db.assets.findIndex(a => a.id === assetId);
      if (assetIdx !== -1) this.db.assets[assetIdx].status = 'ASSIGNED';
      return assignment;
    }
    return {};
  }

  returnAsset(assetId: string, tenantId: string) {
    if (this.db.isFallbackMode) {
      this.db.assetAssignments = this.db.assetAssignments.map(a =>
        a.assetId === assetId && !a.returnedAt ? { ...a, returnedAt: new Date() } : a
      );
      const assetIdx = this.db.assets.findIndex(a => a.id === assetId);
      if (assetIdx !== -1) this.db.assets[assetIdx].status = 'AVAILABLE';
      return { message: 'Asset returned successfully' };
    }
    return {};
  }
}
