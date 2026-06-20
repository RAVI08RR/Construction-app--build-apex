# HRMS Integration Task Checklist

- [ ] Update Database Models & Seeds
    - [ ] Update `backend/prisma/schema.prisma` with HRMS (Employee, Attendance, Leave, Payroll, Assets) tables
    - [ ] Run `npm run prisma:generate` to refresh client compiler types
    - [ ] Update `backend/src/database/database.service.ts` to mock-seed employee lists, geo locations, salary slip distributions, and equipment assets
- [ ] Update API Aggregation Services
    - [ ] Expand NestJS `dashboard/dashboard.service.ts` getMetrics response to return payroll run totals, asset arrays, and attendance log aggregates
- [ ] Modernize Web Frontend Layout & Interface
    - [ ] Update Left Sidebar links in `frontend/src/app/dashboard/layout.tsx` to include Employees, Attendance, Labours, Payroll, and Assets
    - [ ] Add the HRMS & Payroll tab to the main Metrics Cockpit in `frontend/src/app/dashboard/page.tsx`
    - [ ] Build interactive widgets for:
        - [ ] Geo-Fence GPS Attendance Check-In simulation (mobile viewport preview)
        - [ ] Selfie verification and GPS tracking compliance rate gauges
        - [ ] Salary distribution summary (Total, Distributed, Pending)
        - [ ] QR code tracking for inventory assets
        - [ ] AI Attendance fraud indicators and Labour cost projections
- [ ] Verification & Startup
    - [ ] Verify hot-reload compiles without errors
    - [ ] Launch preview server and test Check-in GPS radius comparisons
