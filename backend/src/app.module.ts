import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { ReportsModule } from './reports/reports.module';
import { UploadsModule } from './uploads/uploads.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmployeesModule } from './employees/employees.module';
import { HrmsModule } from './hrms/hrms.module';
import { AssetsModule } from './assets/assets.module';
import { VendorsModule } from './vendors/vendors.module';
import { MaterialsModule } from './materials/materials.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    ProjectsModule,
    TasksModule,
    ReportsModule,
    UploadsModule,
    DashboardModule,
    EmployeesModule,
    HrmsModule,
    AssetsModule,
    VendorsModule,
    MaterialsModule,
  ],
})
export class AppModule {}
