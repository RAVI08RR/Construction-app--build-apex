import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Materials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.materialsService.findAll(req.user.tenantId);
  }

  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.materialsService.create({ ...body, tenantId: req.user.tenantId });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.materialsService.update(id, body, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.materialsService.remove(id, req.user.tenantId);
  }
}
