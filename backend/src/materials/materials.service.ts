import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const genId = () => Math.random().toString(36).slice(2, 10);

const MATERIALS_STORE: any[] = [
  { id: 'mat-1', tenantId: 'tenant-1', name: 'OPC Cement (bags)', category: 'Cement', unit: 'bags', currentStock: 450, totalCapacity: 1000, reorderLevel: 200, unitPrice: 380, supplier: 'UltraTech Cement', lastUpdated: new Date(), status: 'LOW_STOCK' },
  { id: 'mat-2', tenantId: 'tenant-1', name: 'TMT Steel (tons)', category: 'Steel', unit: 'tons', currentStock: 18, totalCapacity: 25, reorderLevel: 5, unitPrice: 65000, supplier: 'Tata Tiscon', lastUpdated: new Date(), status: 'ADEQUATE' },
  { id: 'mat-3', tenantId: 'tenant-1', name: 'River Sand (brass)', category: 'Sand & Aggregate', unit: 'brass', currentStock: 120, totalCapacity: 200, reorderLevel: 50, unitPrice: 12000, supplier: 'Local Supplier', lastUpdated: new Date(), status: 'ADEQUATE' },
  { id: 'mat-4', tenantId: 'tenant-1', name: 'AAC Bricks (units)', category: 'Masonry', unit: 'units', currentStock: 1500, totalCapacity: 5000, reorderLevel: 1000, unitPrice: 65, supplier: 'Renacon AAC', lastUpdated: new Date(), status: 'LOW_STOCK' },
  { id: 'mat-5', tenantId: 'tenant-1', name: 'Coarse Aggregate 20mm (tons)', category: 'Sand & Aggregate', unit: 'tons', currentStock: 45, totalCapacity: 80, reorderLevel: 20, unitPrice: 1800, supplier: 'Quarry Direct', lastUpdated: new Date(), status: 'ADEQUATE' },
  { id: 'mat-6', tenantId: 'tenant-1', name: 'Plywood Formwork (sheets)', category: 'Formwork', unit: 'sheets', currentStock: 8, totalCapacity: 150, reorderLevel: 30, unitPrice: 2200, supplier: 'Century Ply', lastUpdated: new Date(), status: 'CRITICAL' },
];

@Injectable()
export class MaterialsService {
  constructor(private db: DatabaseService) {}

  findAll(tenantId: string) {
    return MATERIALS_STORE.filter(m => m.tenantId === tenantId).map(m => ({
      ...m,
      stockPercent: Math.round((m.currentStock / m.totalCapacity) * 100),
      valueOnHand: m.currentStock * m.unitPrice,
    }));
  }

  create(data: any) {
    const pct = Math.round((data.currentStock / data.totalCapacity) * 100);
    const status = pct <= 20 ? 'CRITICAL' : pct <= 40 ? 'LOW_STOCK' : 'ADEQUATE';
    const newMat = {
      id: `mat-${genId()}`,
      ...data,
      status,
      lastUpdated: new Date(),
      createdAt: new Date(),
    };
    MATERIALS_STORE.push(newMat);
    return newMat;
  }

  update(id: string, data: any, tenantId: string) {
    const idx = MATERIALS_STORE.findIndex(m => m.id === id && m.tenantId === tenantId);
    if (idx === -1) return null;
    const updated = { ...MATERIALS_STORE[idx], ...data, lastUpdated: new Date() };
    const pct = Math.round((updated.currentStock / updated.totalCapacity) * 100);
    updated.status = pct <= 20 ? 'CRITICAL' : pct <= 40 ? 'LOW_STOCK' : 'ADEQUATE';
    MATERIALS_STORE[idx] = updated;
    return MATERIALS_STORE[idx];
  }

  remove(id: string, tenantId: string) {
    const idx = MATERIALS_STORE.findIndex(m => m.id === id && m.tenantId === tenantId);
    if (idx === -1) return null;
    const removed = MATERIALS_STORE.splice(idx, 1)[0];
    return { message: 'Material removed', id: removed.id };
  }
}
