import { Controller, Get, Post, Body, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Daily Site Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve daily site reports of a project' })
  @ApiQuery({ name: 'projectId', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Return reports list.' })
  async findAll(@Query('projectId') projectId: string) {
    if (!projectId) {
      throw new BadRequestException('projectId query parameter is required');
    }
    return this.reportsService.findAll(projectId);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a new daily site report with labor count and photos' })
  @ApiResponse({ status: 201, description: 'Report submitted successfully.' })
  async create(@Body() dto: CreateReportDto, @Request() req: any) {
    return this.reportsService.create(dto, req.user.id);
  }
}
