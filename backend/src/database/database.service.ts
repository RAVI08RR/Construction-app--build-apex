import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('DatabaseService');
  public isFallbackMode = false;

  // In-Memory Database Store for Fallback
  public tenants: any[] = [];
  public users: any[] = [];
  public projectMembers: any[] = [];
  public projects: any[] = [];
  public milestones: any[] = [];
  public tasks: any[] = [];
  public comments: any[] = [];
  public siteReports: any[] = [];
  public reportPhotos: any[] = [];
  public documents: any[] = [];
  public boqItems: any[] = [];
  public equipments: any[] = [];
  public approvalRequests: any[] = [];
  public auditLogs: any[] = [];

  // HRMS & Asset Management Extensions
  public employees: any[] = [];
  public employeeAttendances: any[] = [];
  public employeeLeaves: any[] = [];
  public payrollRuns: any[] = [];
  public payslips: any[] = [];
  public assets: any[] = [];
  public assetAssignments: any[] = [];

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      // Test database connection
      await this.$connect();
      this.logger.log('Successfully connected to PostgreSQL via Prisma.');
    } catch (error) {
      this.logger.error('Failed to connect to PostgreSQL database via Prisma.');
      this.logger.warn('WARNING: Running in In-Memory Fallback Mode. All data will be mock and transient.');
      this.isFallbackMode = true;
      this.seedInMemoryDb();
    }
  }

  async onModuleDestroy() {
    if (!this.isFallbackMode) {
      await this.$disconnect();
    }
  }

  private seedInMemoryDb() {
    // 1. Create Tenant
    const defaultTenant = {
      id: 'tenant-1',
      name: 'Apex Builders Corp',
      domain: 'apexbuilders',
      plan: 'PROFESSIONAL',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tenants.push(defaultTenant);

    // 2. Create Users with diverse roles
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync('Password@123', saltRounds);

    const usersList = [
      { id: 'user-builder', tenantId: 'tenant-1', email: 'builder@apex.com', passwordHash, name: 'Rajesh Sharma', role: 'OWNER', isActive: true },
      { id: 'user-pm', tenantId: 'tenant-1', email: 'pm@apex.com', passwordHash, name: 'Vikram Malhotra', role: 'MEMBER', isActive: true },
      { id: 'user-engineer', tenantId: 'tenant-1', email: 'engineer@apex.com', passwordHash, name: 'Arun Patel', role: 'MEMBER', isActive: true },
      { id: 'user-contractor', tenantId: 'tenant-1', email: 'contractor@apex.com', passwordHash, name: 'Sunil Verma', role: 'MEMBER', isActive: true },
      { id: 'user-architect', tenantId: 'tenant-1', email: 'architect@apex.com', passwordHash, name: 'Priya Iyer', role: 'MEMBER', isActive: true },
      { id: 'user-designer', tenantId: 'tenant-1', email: 'designer@apex.com', passwordHash, name: 'Neha Kapoor', role: 'MEMBER', isActive: true },
      { id: 'user-client', tenantId: 'tenant-1', email: 'client@client.com', passwordHash, name: 'Aditya Birla', role: 'MEMBER', isActive: true },
    ];
    this.users.push(...usersList);

    // 3. Create Sample Projects
    const project1 = {
      id: 'project-1',
      tenantId: 'tenant-1',
      name: 'Luxury Villa - Sector 54',
      description: 'Construction of a premium 5-bedroom luxury villa with smart home automation.',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      budget: 50000000, // ₹5 Crores
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const project2 = {
      id: 'project-2',
      tenantId: 'tenant-1',
      name: 'Greenwood Commercial Complex',
      description: 'A 4-storey commercial retail space prioritizing eco-friendly certification.',
      startDate: new Date('2026-03-15'),
      endDate: new Date('2027-06-30'),
      budget: 150000000, // ₹15 Crores
      status: 'PLANNING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const project3 = {
      id: 'project-3',
      tenantId: 'tenant-1',
      name: 'Skyline Heights - Tower A',
      description: 'High-rise residential apartment project containing 80 luxury flats.',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2026-05-30'),
      budget: 250000000, // ₹25 Crores
      status: 'DELAYED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.push(project1, project2, project3);

    // 4. Assign Roles in Project 1 (Luxury Villa)
    this.projectMembers.push(
      { id: 'pm-member', projectId: 'project-1', userId: 'user-pm', role: 'PROJECT_MANAGER', createdAt: new Date() },
      { id: 'eng-member', projectId: 'project-1', userId: 'user-engineer', role: 'SITE_ENGINEER', createdAt: new Date() },
      { id: 'con-member', projectId: 'project-1', userId: 'user-contractor', role: 'CONTRACTOR', createdAt: new Date() },
      { id: 'arc-member', projectId: 'project-1', userId: 'user-architect', role: 'ARCHITECT', createdAt: new Date() },
      { id: 'des-member', projectId: 'project-1', userId: 'user-designer', role: 'INTERIOR_DESIGNER', createdAt: new Date() },
      { id: 'cli-member', projectId: 'project-1', userId: 'user-client', role: 'CLIENT', createdAt: new Date() },
    );

    // 5. Create Milestones for Project 1
    const m1 = { id: 'ms-1', projectId: 'project-1', name: 'Excavation & Foundation', description: 'Digging ground and laying foundation concrete.', dueDate: new Date('2026-02-15'), progress: 100, createdAt: new Date(), updatedAt: new Date() };
    const m2 = { id: 'ms-2', projectId: 'project-1', name: 'Superstructure Framework', description: 'RCC pillars, columns, slab casting.', dueDate: new Date('2026-06-30'), progress: 75, createdAt: new Date(), updatedAt: new Date() };
    const m3 = { id: 'ms-3', projectId: 'project-1', name: 'Brickwork & Plastering', description: 'Masonry walls and internal/external cement plaster.', dueDate: new Date('2026-09-15'), progress: 30, createdAt: new Date(), updatedAt: new Date() };
    const m4 = { id: 'ms-4', projectId: 'project-1', name: 'Electrical & Plumbing', description: 'Internal pipe fitting and wiring setup.', dueDate: new Date('2026-10-31'), progress: 0, createdAt: new Date(), updatedAt: new Date() };
    const m5 = { id: 'ms-5', projectId: 'project-1', name: 'Finishing & Woodwork', description: 'Flooring tiles, wall painting, kitchen cabinets.', dueDate: new Date('2026-12-15'), progress: 0, createdAt: new Date(), updatedAt: new Date() };
    this.milestones.push(m1, m2, m3, m4, m5);

    // 6. Create Tasks
    const t1 = {
      id: 'task-1',
      projectId: 'project-1',
      milestoneId: 'ms-2',
      title: 'Cast First Floor Slab',
      description: 'Coordinate cement delivery and arrange concrete mixers for casting the roof slab.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2026-06-25'),
      createdById: 'user-pm',
      assigneeId: 'user-engineer',
      createdAt: new Date('2026-06-10'),
      updatedAt: new Date(),
    };
    const t2 = {
      id: 'task-2',
      projectId: 'project-1',
      milestoneId: 'ms-2',
      title: 'Assemble Steel Rebars',
      description: 'Laying steel reinforcement grids for columns according to structural designs.',
      status: 'COMPLETED',
      priority: 'CRITICAL',
      dueDate: new Date('2026-06-18'),
      createdById: 'user-pm',
      assigneeId: 'user-contractor',
      createdAt: new Date('2026-06-05'),
      updatedAt: new Date('2026-06-18'),
    };
    const t3 = {
      id: 'task-3',
      projectId: 'project-1',
      milestoneId: 'ms-3',
      title: 'Procure AAC Blocks',
      description: 'Purchase 5000 bricks/AAC blocks for partitioning rooms.',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: new Date('2026-07-10'),
      createdById: 'user-pm',
      assigneeId: 'user-engineer',
      createdAt: new Date('2026-06-15'),
      updatedAt: new Date(),
    };
    const t4 = {
      id: 'task-4',
      projectId: 'project-1',
      milestoneId: 'ms-2',
      title: 'Validate Floor Alignments',
      description: 'Check column levels and laser alignment prior to concrete pouring.',
      status: 'DELAYED',
      priority: 'HIGH',
      dueDate: new Date('2026-06-15'),
      createdById: 'user-pm',
      assigneeId: 'user-architect',
      createdAt: new Date('2026-06-01'),
      updatedAt: new Date(),
    };
    this.tasks.push(t1, t2, t3, t4);

    // 7. Add Comments
    this.comments.push(
      { id: 'c-1', taskId: 'task-1', userId: 'user-engineer', content: 'Cement suppliers are delayed. Ready to cast by tomorrow morning.', createdAt: new Date('2026-06-19T09:00:00Z') },
      { id: 'c-2', taskId: 'task-1', userId: 'user-pm', content: 'Approved. Get steel reinforcement signoff from architect Priya first.', createdAt: new Date('2026-06-19T10:30:00Z') },
    );

    // 8. Daily Site Reports
    const r1 = {
      id: 'report-1',
      projectId: 'project-1',
      reportDate: new Date('2026-06-19'),
      workCompleted: 'Cast columns for floor 1. Brickwork completed on North face of ground floor.',
      labourCount: 22,
      weather: 'Sunny - 32°C',
      remarks: 'Material delivery arrived (200 bags cement). All labourers equipped with safety gear.',
      submittedById: 'user-engineer',
      createdAt: new Date('2026-06-19T17:00:00Z'),
    };
    this.siteReports.push(r1);

    this.reportPhotos.push(
      { id: 'photo-1', siteReportId: 'report-1', photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80', caption: 'Floor 1 columns casting work', uploadedAt: new Date() }
    );

    // 9. Documents
    this.documents.push(
      { id: 'doc-1', projectId: 'project-1', name: 'Villa Architectural Blueprint.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'BLUEPRINT', uploadedById: 'user-architect', createdAt: new Date('2026-01-05') },
      { id: 'doc-2', projectId: 'project-1', name: 'Contract Agreement Signature.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'CONTRACT', uploadedById: 'user-builder', createdAt: new Date('2026-01-10') },
      { id: 'doc-3', projectId: 'project-1', name: 'BOQ - Materials Estimate.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'BOQ', uploadedById: 'user-pm', createdAt: new Date('2026-01-12') }
    );

    // 10. BOQ Items
    this.boqItems.push(
      { id: 'boq-1', projectId: 'project-1', category: 'Earthwork', description: 'Excavation in all soils including loading and dumping.', unit: 'cum', plannedQty: 1200, actualQty: 1200, plannedRate: 150, actualRate: 150 },
      { id: 'boq-2', projectId: 'project-1', category: 'Concrete', description: 'Reinforced cement concrete M25 grade in superstructure columns.', unit: 'cum', plannedQty: 350, actualQty: 280, plannedRate: 8500, actualRate: 8700 },
      { id: 'boq-3', projectId: 'project-1', category: 'Masonry', description: 'Brick masonry work with AAC blocks in cement mortar.', unit: 'sqm', plannedQty: 1800, actualQty: 900, plannedRate: 1100, actualRate: 1100 },
      { id: 'boq-4', projectId: 'project-1', category: 'Finishing', description: 'Vitrified flooring tiles and plastic emulsion wall painting.', unit: 'sqm', plannedQty: 2200, actualQty: 220, plannedRate: 750, actualRate: 780 }
    );

    // 11. Equipment
    this.equipments.push(
      { id: 'eq-1', tenantId: 'tenant-1', name: 'CAT Excavator 320D', modelNumber: '320D-2024', status: 'AVAILABLE', location: 'Luxury Villa - Sector 54', lastServiced: new Date('2026-04-10') },
      { id: 'eq-2', tenantId: 'tenant-1', name: 'Liebherr Tower Crane', modelNumber: 'LC-90', status: 'IN_USE', location: 'Skyline Heights - Tower A', lastServiced: new Date('2026-03-01') },
      { id: 'eq-3', tenantId: 'tenant-1', name: 'Sany Concrete Mixer Truck', modelNumber: 'SM-10', status: 'MAINTENANCE', location: 'Luxury Villa - Sector 54', lastServiced: new Date('2026-06-15') }
    );

    // 12. Approval Requests (PO/Invoice Signoffs)
    this.approvalRequests.push(
      { id: 'apr-1', tenantId: 'tenant-1', projectId: 'project-1', title: 'PO-2026-012 Cement Purchase Request', targetType: 'PURCHASE_ORDER', targetId: 'po-1', status: 'SUBMITTED', submittedById: 'user-pm', remarks: 'Procuring 400 bags cement for floor 1 slab.' },
      { id: 'apr-2', tenantId: 'tenant-1', projectId: 'project-1', title: 'Invoice #8472 Structural Inspection Bill', targetType: 'INVOICE', targetId: 'inv-1', status: 'REVIEWED', submittedById: 'user-engineer', remarks: 'Signoff requested by structural consultant.' },
      { id: 'apr-3', tenantId: 'tenant-1', projectId: 'project-1', title: 'Interior Layout Revision Drawing V4', targetType: 'DRAWING', targetId: 'doc-1', status: 'APPROVED', submittedById: 'user-designer', remarks: 'Approved by Architect Priya.' }
    );

    // 13. Audit Logs
    this.auditLogs.push(
      { id: 'log-1', tenantId: 'tenant-1', userId: 'user-pm', action: 'CREATE', entityName: 'Task', entityId: 'task-3', oldValue: null, newValue: 'AAC Blocks procurement request initialized', timestamp: new Date('2026-06-15T09:00:00Z') },
      { id: 'log-2', tenantId: 'tenant-1', userId: 'user-engineer', action: 'UPDATE', entityName: 'Task', entityId: 'task-1', oldValue: 'PENDING', newValue: 'IN_PROGRESS', timestamp: new Date('2026-06-19T10:00:00Z') },
      { id: 'log-3', tenantId: 'tenant-1', userId: 'user-builder', action: 'APPROVE', entityName: 'ApprovalRequest', entityId: 'apr-3', oldValue: 'SUBMITTED', newValue: 'APPROVED', timestamp: new Date('2026-06-20T12:00:00Z') }
    );

    // 14. Seed Employees (HRMS)
    this.employees.push(
      { id: 'emp-1', tenantId: 'tenant-1', employeeId: 'EMP-2026-001', name: 'Rajesh Sharma', email: 'builder@apex.com', mobile: '9876543210', department: 'ADMIN', designation: 'Managing Director / Builder', assignedProjId: 'project-1', salaryBasic: 250000, allowanceHRA: 50000, allowanceMisc: 20000, status: 'ACTIVE', joiningDate: new Date('2024-01-01') },
      { id: 'emp-2', tenantId: 'tenant-1', employeeId: 'EMP-2026-002', name: 'Vikram Malhotra', email: 'pm@apex.com', mobile: '9876543211', department: 'ENGINEERING', designation: 'Senior Project Manager', assignedProjId: 'project-1', salaryBasic: 120000, allowanceHRA: 24000, allowanceMisc: 10000, status: 'ACTIVE', joiningDate: new Date('2024-06-15') },
      { id: 'emp-3', tenantId: 'tenant-1', employeeId: 'EMP-2026-003', name: 'Arun Patel', email: 'engineer@apex.com', mobile: '9876543212', department: 'OPERATIONS', designation: 'Onsite Site Engineer', assignedProjId: 'project-1', salaryBasic: 65000, allowanceHRA: 13000, allowanceMisc: 5000, status: 'ACTIVE', joiningDate: new Date('2025-02-20') },
      { id: 'emp-4', tenantId: 'tenant-1', employeeId: 'EMP-2026-004', name: 'Priya Iyer', email: 'architect@apex.com', mobile: '9876543213', department: 'ENGINEERING', designation: 'Chief Architect', assignedProjId: 'project-1', salaryBasic: 110000, allowanceHRA: 22000, allowanceMisc: 8000, status: 'ACTIVE', joiningDate: new Date('2024-11-01') }
    );

    // 15. Geo-Attendance check-in records
    this.employeeAttendances.push(
      { id: 'att-1', employeeId: 'emp-3', date: new Date('2026-06-20'), checkIn: new Date('2026-06-20T09:00:00Z'), checkOut: null, checkInLat: 28.6142, checkInLng: 77.2088, status: 'PRESENT', distanceMtrs: 42, isFraudFlag: false, selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
      { id: 'att-2', employeeId: 'emp-2', date: new Date('2026-06-20'), checkIn: new Date('2026-06-20T08:50:00Z'), checkOut: null, checkInLat: 28.6139, checkInLng: 77.2090, status: 'PRESENT', distanceMtrs: 0, isFraudFlag: false, selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
      // Flagged Fraud Checkin: Check-in from far away
      { id: 'att-3', employeeId: 'emp-4', date: new Date('2026-06-20'), checkIn: new Date('2026-06-20T09:30:00Z'), checkOut: null, checkInLat: 28.5355, checkInLng: 77.3910, status: 'PRESENT', distanceMtrs: 2250, isFraudFlag: true, fraudRemarks: 'Check-in location 2.2km away from geofence radius.', selfieUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' }
    );

    // 16. Salary Payroll runs & payslips
    const prId = 'payroll-run-1';
    this.payrollRuns.push({
      id: prId,
      tenantId: 'tenant-1',
      month: '2026-06',
      totalPayroll: 1850000,
      distributedAmt: 1620000,
      status: 'APPROVED',
      createdAt: new Date(),
    });

    this.payslips.push(
      { id: 'psl-1', payrollRunId: prId, employeeId: 'emp-3', basicPaid: 65000, hraPaid: 13000, bonusPaid: 5000, deductPF: 7800, deductESIC: 480, netPaid: 74720, payslipUrl: '#' },
      { id: 'psl-2', payrollRunId: prId, employeeId: 'emp-2', basicPaid: 120000, hraPaid: 24000, bonusPaid: 10000, deductPF: 14400, deductESIC: 880, netPaid: 138720, payslipUrl: '#' }
    );

    // 17. Seed Assets (QR tracking)
    this.assets.push(
      { id: 'as-1', tenantId: 'tenant-1', assetId: 'AST-EXC-002', name: 'CAT Excavator 320D', category: 'MACHINERY', purchaseDate: new Date('2024-03-10'), value: 4500000, status: 'ASSIGNED', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AST-EXC-002' },
      { id: 'as-2', tenantId: 'tenant-1', assetId: 'AST-MIX-015', name: 'Sany Concrete Mixer Truck', category: 'VEHICLE', purchaseDate: new Date('2025-01-20'), value: 2800000, status: 'MAINTENANCE', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AST-MIX-015' },
      { id: 'as-3', tenantId: 'tenant-1', assetId: 'AST-DRL-084', name: 'Hilti Concrete Drill machine', category: 'SAFETY_GEAR', purchaseDate: new Date('2026-02-15'), value: 65000, status: 'AVAILABLE', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AST-DRL-084' },
      { id: 'as-4', tenantId: 'tenant-1', assetId: 'AST-LPT-293', name: 'Lenovo ThinkPad P16 (PM laptop)', category: 'ELECTRONIC', purchaseDate: new Date('2025-10-10'), value: 160000, status: 'ASSIGNED', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AST-LPT-293' }
    );

    this.assetAssignments.push(
      { id: 'asg-1', assetId: 'as-1', employeeId: 'emp-3', assignedAt: new Date('2026-06-01'), returnedAt: null, remarks: 'Assigned to Arun for excavation floor casting.' },
      { id: 'asg-2', assetId: 'as-4', employeeId: 'emp-2', assignedAt: new Date('2025-10-15'), returnedAt: null, remarks: 'Senior project manager dashboard management.' }
    );

    this.logger.log('In-memory database seeded successfully with mock data.');
  }
}
