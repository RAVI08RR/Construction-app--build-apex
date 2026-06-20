import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HrmsService } from './hrms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('HRMS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hrms')
export class HrmsController {
  constructor(private readonly hrmsService: HrmsService) {}

  // ---- ATTENDANCE ----
  @Get('attendance')
  @ApiOperation({ summary: 'List all attendance records' })
  getAttendance(@Request() req: any) {
    return this.hrmsService.getAttendance(req.user.tenantId);
  }

  @Post('attendance')
  @ApiOperation({ summary: 'Submit a geo attendance check-in' })
  checkIn(@Body() body: any, @Request() req: any) {
    return this.hrmsService.checkIn({ ...body, tenantId: req.user.tenantId });
  }

  // ---- PAYROLL ----
  @Get('payroll')
  @ApiOperation({ summary: 'Get payroll runs' })
  getPayroll(@Request() req: any) {
    return this.hrmsService.getPayrollRuns(req.user.tenantId);
  }

  @Post('payroll/run')
  @ApiOperation({ summary: 'Trigger a new payroll run' })
  runPayroll(@Body() body: any, @Request() req: any) {
    return this.hrmsService.runPayroll({ ...body, tenantId: req.user.tenantId });
  }

  @Post('payroll/:runId/approve')
  @ApiOperation({ summary: 'Approve a payroll run for disbursement' })
  approvePayroll(@Param('runId') runId: string, @Request() req: any) {
    return this.hrmsService.approvePayroll(runId, req.user.tenantId);
  }

  @Get('payslips/:runId')
  @ApiOperation({ summary: 'Get payslips for a payroll run' })
  getPayslips(@Param('runId') runId: string) {
    return this.hrmsService.getPayslips(runId);
  }

  // ---- LABOUR LOGS ----
  @Get('labour')
  @ApiOperation({ summary: 'Get labour shift logs' })
  getLabour(@Request() req: any) {
    return this.hrmsService.getLabour(req.user.tenantId);
  }

  @Post('labour')
  @ApiOperation({ summary: 'Log a new labour shift' })
  logLabour(@Body() body: any, @Request() req: any) {
    return this.hrmsService.logLabour({ ...body, tenantId: req.user.tenantId });
  }
}
