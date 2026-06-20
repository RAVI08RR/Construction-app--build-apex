import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.assetsService.findAll(req.user.tenantId);
  }

  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.assetsService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.assetsService.update(id, body, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.assetsService.remove(id, req.user.tenantId);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign asset to an employee' })
  assign(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.assetsService.assignAsset(id, body.employeeId, req.user.tenantId);
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Mark asset as returned' })
  returnAsset(@Param('id') id: string, @Request() req: any) {
    return this.assetsService.returnAsset(id, req.user.tenantId);
  }
}
