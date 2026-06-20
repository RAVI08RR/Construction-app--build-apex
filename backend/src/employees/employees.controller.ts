import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List all employees' })
  findAll(@Request() req: any, @Query('dept') dept?: string) {
    return this.employeesService.findAll(req.user.tenantId, dept);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single employee' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.employeesService.findOne(id, req.user.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  create(@Body() body: any, @Request() req: any) {
    return this.employeesService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an employee' })
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.employeesService.update(id, body, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an employee' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.employeesService.remove(id, req.user.tenantId);
  }
}
