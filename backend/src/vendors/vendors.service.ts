import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const genId = () => Math.random().toString(36).slice(2, 10);

// Extend database service with vendor list (fallback)
const VENDORS_STORE: any[] = [
  { id: 'v-1', tenantId: 'tenant-1', name: 'UltraTech Cement Supplier', contact: 'Manoj Bajpayee', phone: '9876543001', email: 'manoj@ultratech.com', category: 'Cement & Concrete', gstNumber: '27AABCU5603R1ZP', score: 4.8, status: 'ACTIVE', city: 'Mumbai', createdAt: new Date() },
  { id: 'v-2', tenantId: 'tenant-1', name: 'Tata Tiscon Steel distributor', contact: 'Vijay Raaz', phone: '9876543002', email: 'vijay@tatatiscon.com', category: 'Reinforced Rebars', gstNumber: '27AAACT2727Q1Z4', score: 4.9, status: 'ACTIVE', city: 'Pune', createdAt: new Date() },
  { id: 'v-3', tenantId: 'tenant-1', name: 'Hindware Bathrooms & Sanitary', contact: 'Kirti Kulhari', phone: '9876543003', email: 'kirti@hindware.com', category: 'Sanitary fittings', gstNumber: '07AAACH3006J1ZN', score: 4.2, status: 'ACTIVE', city: 'Delhi', createdAt: new Date() },
  { id: 'v-4', tenantId: 'tenant-1', name: 'Asian Paints Coating Solutions', contact: 'Rahul Bose', phone: '9876543004', email: 'rahul@asianpaints.com', category: 'Paints & Coatings', gstNumber: '27AAACA0977A1Z3', score: 4.6, status: 'ACTIVE', city: 'Mumbai', createdAt: new Date() },
];

@Injectable()
export class VendorsService {
  constructor(private db: DatabaseService) {}

  findAll(tenantId: string) {
    return VENDORS_STORE.filter(v => v.tenantId === tenantId);
  }

  create(data: any) {
    const newVendor = {
      id: `v-${genId()}`,
      ...data,
      score: data.score || 4.0,
      status: 'ACTIVE',
      createdAt: new Date(),
    };
    VENDORS_STORE.push(newVendor);
    return newVendor;
  }

  update(id: string, data: any, tenantId: string) {
    const idx = VENDORS_STORE.findIndex(v => v.id === id && v.tenantId === tenantId);
    if (idx === -1) return null;
    VENDORS_STORE[idx] = { ...VENDORS_STORE[idx], ...data, updatedAt: new Date() };
    return VENDORS_STORE[idx];
  }

  remove(id: string, tenantId: string) {
    const idx = VENDORS_STORE.findIndex(v => v.id === id && v.tenantId === tenantId);
    if (idx === -1) return null;
    const removed = VENDORS_STORE.splice(idx, 1)[0];
    return { message: 'Vendor removed', id: removed.id };
  }
}
