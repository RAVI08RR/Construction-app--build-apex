# Unified Construction ERP + HRMS + Payroll + Asset Tracking SaaS Architecture

This implementation plan details the schema expansions, backend APIs, and frontend layouts to add a complete HRMS, Payroll, Geo-Fenced Attendance, and Asset QR Tracking module to the Construction Project Management SaaS.

---

## 1. Expanded Database Model (Prisma Schema)

We will add the following database schemas to represent employee identity, geo-attendance locations, payroll distributions, labour shifts, and physical asset allocations:

```prisma
// ==========================================
// 13. HRMS & EMPLOYEE MANAGEMENT
// ==========================================

model Employee {
  id            String              @id @default(uuid())
  tenantId      String
  tenant        Tenant              @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  employeeId    String              @unique // e.g. "EMP-2026-001"
  name          String
  email         String              @unique
  mobile        String?
  department    Department
  designation   String
  assignedProjId String?
  project       Project?            @relation(fields: [assignedProjId], references: [id], onDelete: SetNull)
  salaryBasic   Decimal             @db.Decimal(12, 2)
  allowanceHRA  Decimal             @db.Decimal(10, 2) @default(0.00)
  allowanceMisc Decimal             @db.Decimal(10, 2) @default(0.00)
  joiningDate   DateTime            @default(now())
  status        EmployeeStatus      @default(ACTIVE)
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  attendance    EmployeeAttendance[]
  leaves        EmployeeLeave[]
  payslips      Payslip[]
  assets        AssetAssignment[]

  @@index([tenantId])
}

enum Department {
  ENGINEERING
  HR
  ACCOUNTS
  PROCUREMENT
  OPERATIONS
  ADMIN
  SAFETY
  QUALITY
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
  TERMINATED
  ON_LEAVE
}

// ==========================================
// 14. GEO-FENCED ATTENDANCE
// ==========================================

model EmployeeAttendance {
  id           String           @id @default(uuid())
  employeeId   String
  employee     Employee         @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  date         DateTime
  checkIn      DateTime
  checkOut     DateTime?
  checkInLat   Float
  checkInLng   Float
  status       AttendanceType   @default(PRESENT)
  distanceMtrs Float?           // Distance from site center during check-in
  selfieUrl    String?          // Selfie attachment
  isFraudFlag  Boolean          @default(false)
  fraudRemarks String?
  createdAt    DateTime         @default(now())

  @@unique([employeeId, date])
  @@index([employeeId])
}

enum AttendanceType {
  PRESENT
  ABSENT
  LATE_ENTRY
  HALF_DAY
  REMOTE_WORK
  LEAVE
}

model EmployeeLeave {
  id           String       @id @default(uuid())
  employeeId   String
  employee     Employee     @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  startDate    DateTime
  endDate      DateTime
  type         LeaveType
  status       LeaveStatus  @default(PENDING)
  reason       String?
  reviewedById String?
  createdAt    DateTime     @default(now())

  @@index([employeeId])
}

enum LeaveType {
  CASUAL
  SICK
  MATERNITY
  SABBATICAL
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
}

// ==========================================
// 15. PAYROLL CALCULATIONS
// ==========================================

model PayrollRun {
  id             String             @id @default(uuid())
  tenantId       String
  month          String             // e.g. "2026-06"
  totalPayroll   Decimal            @db.Decimal(15, 2)
  distributedAmt Decimal            @db.Decimal(15, 2) @default(0.00)
  status         PayrollStatus      @default(PENDING)
  createdAt      DateTime           @default(now())
  payslips       Payslip[]

  @@unique([tenantId, month])
}

enum PayrollStatus {
  PENDING
  APPROVED
  PAID
}

model Payslip {
  id           String     @id @default(uuid())
  payrollRunId String
  payrollRun   PayrollRun @relation(fields: [payrollRunId], references: [id], onDelete: Cascade)
  employeeId   String
  employee     Employee   @relation(fields: [employeeId], references: [id])
  basicPaid    Decimal    @db.Decimal(12, 2)
  hraPaid      Decimal    @db.Decimal(10, 2)
  bonusPaid    Decimal    @db.Decimal(10, 2) @default(0.00)
  deductPF     Decimal    @db.Decimal(10, 2) @default(0.00)
  deductESIC   Decimal    @db.Decimal(10, 2) @default(0.00)
  netPaid      Decimal    @db.Decimal(12, 2)
  payslipUrl   String?    // PDF path link
  createdAt    DateTime   @default(now())

  @@index([employeeId])
}

// ==========================================
// 16. LABOUR SHIFTS
// ==========================================

model Labour {
  id           String             @id @default(uuid())
  tenantId     String
  tenant       Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  name         String
  trade        LabourTrade
  dailyWage    Decimal            @db.Decimal(10, 2)
  phone        String?
  isActive     Boolean            @default(true)
  attendance   LabourAttendance[]

  @@index([tenantId])
}

enum LabourTrade {
  MASON
  CARPENTER
  ELECTRICIAN
  PAINTER
  WELDER
  HELPER
}

model LabourAttendance {
  id         String           @id @default(uuid())
  labourId   String
  labour     Labour           @relation(fields: [labourId], references: [id], onDelete: Cascade)
  projectId  String
  date       DateTime
  status     AttendanceStatus
  hoursWorked Decimal         @db.Decimal(4, 2) @default(8.0)
  overtimeHrs Decimal         @db.Decimal(4, 2) @default(0.0)
  createdAt  DateTime         @default(now())

  @@unique([labourId, date])
}

// ==========================================
// 17. ASSET MANAGEMENT & QR CODE CODES
// ==========================================

model Asset {
  id           String            @id @default(uuid())
  tenantId     String
  tenant       Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  assetId      String            @unique // e.g. "AST-EXC-002"
  name         String            // Excavator, Concrete Mixer, Laptop
  category     AssetCategory
  purchaseDate DateTime
  value        Decimal           @db.Decimal(12, 2)
  qrCodeUrl    String?           // Generated QR path
  status       AssetStatus       @default(AVAILABLE)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  assignments  AssetAssignment[]

  @@index([tenantId])
}

enum AssetCategory {
  MACHINERY
  VEHICLE
  SAFETY_GEAR
  ELECTRONIC
  OTHER
}

enum AssetStatus {
  AVAILABLE
  ASSIGNED
  MAINTENANCE
  LOST
  DISPOSED
}

model AssetAssignment {
  id          String    @id @default(uuid())
  assetId     String
  asset       Asset     @relation(fields: [assetId], references: [id], onDelete: Cascade)
  employeeId  String
  employee    Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  assignedAt  DateTime  @default(now())
  returnedAt  DateTime?
  remarks     String?

  @@index([assetId])
  @@index([employeeId])
}
```

---

## 2. Dynamic GPS Geo-Fencing Attendance Pipeline

To enforce location authenticity, check-in requests will pass employee GPS coordinates and compile distance metrics relative to the project site center:

$$\text{Distance} = \text{HaversineFormula}(\text{CheckInCoordinates}, \text{ProjectCoordinates})$$

If $\text{Distance} \le \text{FenceRadius}$ (e.g. 200 Meters), check-in succeeds. Otherwise, the API flags a Geo-spoof validation exception.

---

## 3. Frontend Dashboard Additions

1. **HRMS & Payroll tab**:
   - Renders attendance compliance rate gauges.
   - Shows Salary Distribution Card (Total payroll, Distributed payroll, Pending payroll).
   - Display Geo-Attendance Check-In widget with GPS latitude/longitude selector and distance calculation (e.g. 42m, ALLOWED check-in).
   - Display a mock selfie container and QR scanner simulation panel for assets.
2. **AI Fraud Detection Panel**:
   - Highlights flags (e.g., suspicious check-in speed, multiple devices).
3. **Asset Utilization Table**:
   - Lists laptops, mixers, cranes, assigned users, and QR status codes.
4. **Expanded Navigation Sidebar**:
   - Features Dashboard, Projects, Tasks, Site Reports, BOQ, Procurement, Materials, Vendors, Employees, Attendance, Labours, Payroll, Assets, Documents, Finance, Analytics, Settings.

---

## User Review Required

> [!IMPORTANT]
> **Mobile Compatibility Simulation**
> Since many site engineers use mobile interfaces, the Geo-Attendance check-in widget will be styled as an **Employee Portal view** directly on the dashboard screen, mimicking a mobile viewport simulation (e.g., in a side panel or inside the attendance tab). This enables full end-to-end checkout validation natively.
> 
> **Prisma Cascade Mappings**
> Deleting a project will automatically cascade-delete labour attendance, but employee history will be retained (by setting null or transferring) to protect audit trail records.

## Open Questions

> [!NOTE]
> 1. **Salary Calculations**: Should HRA, PF, and ESIC calculations use standard Indian percentage rules (e.g., PF @ 12% basic) or allow custom input fields?
> 2. **GPS Accuracy**: What is the default site geofence radius you wish to configure (e.g., 100m or 200m)?
