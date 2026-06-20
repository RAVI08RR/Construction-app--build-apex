import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Luxury Villa - Sector 54' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Construction of a premium 5-bedroom luxury villa.', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 50000000 })
  @IsNumber()
  @IsNotEmpty()
  budget: number;
}
