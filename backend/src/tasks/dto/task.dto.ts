import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Cast First Floor Slab' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Details about concrete pouring...', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'project-1' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ example: 'ms-2', required: false })
  @IsString()
  @IsOptional()
  milestoneId?: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED'], required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'HIGH', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: false })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiProperty({ example: '2026-06-25', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ example: 'user-engineer', required: false })
  @IsString()
  @IsOptional()
  assigneeId?: string;
}

export class UpdateTaskDto {
  @ApiProperty({ example: 'Cast First Floor Slab', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Details about concrete pouring...', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'IN_PROGRESS', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED'], required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'HIGH', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: false })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiProperty({ example: '2026-06-25', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ example: 'user-engineer', required: false })
  @IsString()
  @IsOptional()
  assigneeId?: string;
}

export class CreateCommentDto {
  @ApiProperty({ example: 'Cement suppliers are delayed. Ready to cast by tomorrow morning.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
