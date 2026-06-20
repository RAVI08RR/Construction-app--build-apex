import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, CreateCommentDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all tasks of a specific project' })
  @ApiQuery({ name: 'projectId', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Return tasks list.' })
  async findAll(@Query('projectId') projectId: string, @Request() req: any) {
    if (!projectId) {
      throw new BadRequestException('projectId query parameter is required');
    }
    return this.tasksService.findAll(projectId, req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a single task with its comments list' })
  @ApiResponse({ status: 200, description: 'Return task detail.' })
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created.' })
  async create(@Body() dto: CreateTaskDto, @Request() req: any) {
    return this.tasksService.create(dto, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update status, assignee, or details of a task' })
  @ApiResponse({ status: 200, description: 'Task updated.' })
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a text comment on a task' })
  @ApiResponse({ status: 201, description: 'Comment added.' })
  async addComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.tasksService.addComment(id, dto.content, req.user.id);
  }
}
