import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNotEmpty, IsString } from 'class-validator';

class PresignedUrlDto {
  @ApiProperty({ example: 'blueprint.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ example: 'project-1' })
  @IsString()
  @IsNotEmpty()
  projectId: string;
}

@ApiTags('Uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  @Post('presigned-url')
  @ApiOperation({ summary: 'Generate a mock S3 presigned URL for direct file upload' })
  @ApiResponse({ status: 201, description: 'Return upload configurations.' })
  async getPresignedUrl(@Body() dto: PresignedUrlDto, @Request() req: any) {
    const tenantId = req.user.tenantId;
    const uniqueKey = `tenants/${tenantId}/projects/${dto.projectId}/${Date.now()}-${dto.fileName}`;
    
    // Simulate S3 presigned URL
    const uploadUrl = `http://localhost:4000/uploads/mock-s3-endpoint?key=${encodeURIComponent(uniqueKey)}`;
    const finalFileUrl = dto.mimeType.startsWith('image/')
      ? 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=800&q=80' // High-quality construction image fallback
      : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'; // Dummy PDF fallback

    return {
      uploadUrl,
      finalFileUrl,
      key: uniqueKey,
    };
  }
}
