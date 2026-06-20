import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ProjectsService {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string) {
    if (this.db.isFallbackMode) {
      return this.db.projects.filter(p => p.tenantId === tenantId);
    }

    return this.db.project.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    if (this.db.isFallbackMode) {
      const project = this.db.projects.find(p => p.id === id && p.tenantId === tenantId);
      if (!project) throw new NotFoundException('Project not found');

      // Include relations
      const milestones = this.db.milestones.filter(m => m.projectId === id);
      const members = this.db.projectMembers
        .filter(m => m.projectId === id)
        .map(m => {
          const user = this.db.users.find(u => u.id === m.userId);
          return { ...m, user: user ? { id: user.id, name: user.name, email: user.email } : null };
        });

      return { ...project, milestones, members };
    }

    const project = await this.db.project.findFirst({
      where: { id, tenantId },
      include: {
        milestones: { orderBy: { dueDate: 'asc' } },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(dto: any, tenantId: string) {
    const projectId = `project-${Date.now()}`;
    const start = new Date(dto.startDate);
    const end = dto.endDate ? new Date(dto.endDate) : null;
    const budget = Number(dto.budget || 0);

    if (this.db.isFallbackMode) {
      const newProject = {
        id: projectId,
        tenantId,
        name: dto.name,
        description: dto.description || '',
        startDate: start,
        endDate: end,
        budget,
        status: 'PLANNING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.db.projects.push(newProject);

      // Create some default milestones for demo
      const milestones = [
        { id: `ms-exc-${Date.now()}`, projectId, name: 'Excavation & Foundation', description: 'Initial site preparation', dueDate: new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000), progress: 0, createdAt: new Date(), updatedAt: new Date() },
        { id: `ms-stru-${Date.now()}`, projectId, name: 'Superstructure Framework', description: 'Slab and column casting', dueDate: new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000), progress: 0, createdAt: new Date(), updatedAt: new Date() },
        { id: `ms-fin-${Date.now()}`, projectId, name: 'Finishing & Handover', description: 'Plastering, painting, and completion', dueDate: end || new Date(start.getTime() + 180 * 24 * 60 * 60 * 1000), progress: 0, createdAt: new Date(), updatedAt: new Date() },
      ];
      this.db.milestones.push(...milestones);

      return { ...newProject, milestones };
    }

    return this.db.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          tenantId,
          name: dto.name,
          description: dto.description,
          startDate: start,
          endDate: end,
          budget,
          status: 'PLANNING',
        },
      });

      // Default milestones
      await tx.milestone.createMany({
        data: [
          { projectId: project.id, name: 'Excavation & Foundation', description: 'Initial site preparation', dueDate: new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000) },
          { projectId: project.id, name: 'Superstructure Framework', description: 'Slab and column casting', dueDate: new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000) },
          { projectId: project.id, name: 'Finishing & Handover', description: 'Plastering, painting, and completion', dueDate: end || new Date(start.getTime() + 180 * 24 * 60 * 60 * 1000) },
        ],
      });

      return tx.project.findUnique({
        where: { id: project.id },
        include: { milestones: true },
      });
    });
  }
}
