import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ example: 'project-1' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ example: '2026-06-20' })
  @IsDateString()
  @IsNotEmpty()
  reportDate: string;

  @ApiProperty({ example: 'Cast floor columns, set brick frames.' })
  @IsString()
  @IsNotEmpty()
  workCompleted: string;

  @ApiProperty({ example: 25 })
  @IsNumber()
  @IsNotEmpty()
  labourCount: number;

  @ApiProperty({ example: 'Clear sky, 35 degrees C', required: false })
  @IsString()
  @IsOptional()
  weather?: string;

  @ApiProperty({ example: 'Steel order delivered', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty({ example: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];
}
