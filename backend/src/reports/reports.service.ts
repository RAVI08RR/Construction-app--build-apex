import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ReportsService {
  constructor(private db: DatabaseService) {}

  async findAll(projectId: string) {
    if (this.db.isFallbackMode) {
      return this.db.siteReports
        .filter(r => r.projectId === projectId)
        .map(r => {
          const photos = this.db.reportPhotos.filter(p => p.siteReportId === r.id);
          const user = this.db.users.find(u => u.id === r.submittedById);
          return { ...r, photos, submittedBy: user ? { id: user.id, name: user.name } : null };
        });
    }

    return this.db.siteReport.findMany({
      where: { projectId },
      include: {
        photos: true,
      },
      orderBy: { reportDate: 'desc' },
    });
  }

  async create(dto: any, userId: string) {
    const reportId = `report-${Date.now()}`;
    const reportDate = new Date(dto.reportDate);

    if (this.db.isFallbackMode) {
      const newReport = {
        id: reportId,
        projectId: dto.projectId,
        reportDate,
        workCompleted: dto.workCompleted,
        labourCount: Number(dto.labourCount),
        weather: dto.weather || 'Sunny',
        remarks: dto.remarks || '',
        submittedById: userId,
        createdAt: new Date(),
      };
      this.db.siteReports.push(newReport);

      if (dto.photos && Array.isArray(dto.photos)) {
        dto.photos.forEach((url: string, index: number) => {
          this.db.reportPhotos.push({
            id: `photo-${Date.now()}-${index}`,
            siteReportId: reportId,
            photoUrl: url,
            caption: `Photo showing progress ${index + 1}`,
            uploadedAt: new Date(),
          });
        });
      }

      return this.findAll(dto.projectId);
    }

    await this.db.$transaction(async (tx) => {
      const report = await tx.siteReport.create({
        data: {
          projectId: dto.projectId,
          reportDate,
          workCompleted: dto.workCompleted,
          labourCount: Number(dto.labourCount),
          weather: dto.weather,
          remarks: dto.remarks,
          submittedById: userId,
        },
      });

      if (dto.photos && Array.isArray(dto.photos)) {
        await tx.reportPhoto.createMany({
          data: dto.photos.map((url: string) => ({
            siteReportId: report.id,
            photoUrl: url,
          })),
        });
      }
    });

    return this.findAll(dto.projectId);
  }
}
