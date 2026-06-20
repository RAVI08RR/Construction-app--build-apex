import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TasksService {
  constructor(private db: DatabaseService) {}

  async findAll(projectId: string, tenantId: string) {
    if (this.db.isFallbackMode) {
      // Security check: verify project belongs to tenant
      const proj = this.db.projects.find(p => p.id === projectId && p.tenantId === tenantId);
      if (!proj) return [];

      return this.db.tasks.filter(t => t.projectId === projectId).map(t => {
        const assignee = this.db.users.find(u => u.id === t.assigneeId);
        return { ...t, assignee: assignee ? { id: assignee.id, name: assignee.name, email: assignee.email } : null };
      });
    }

    return this.db.task.findMany({
      where: {
        projectId,
        project: { tenantId },
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    if (this.db.isFallbackMode) {
      const task = this.db.tasks.find(t => t.id === id);
      if (!task) throw new NotFoundException('Task not found');

      const comments = this.db.comments
        .filter(c => c.taskId === id)
        .map(c => {
          const user = this.db.users.find(u => u.id === c.userId);
          return { ...c, user: user ? { id: user.id, name: user.name } : null };
        });

      const assignee = this.db.users.find(u => u.id === task.assigneeId);
      const creator = this.db.users.find(u => u.id === task.createdById);

      return {
        ...task,
        comments,
        assignee: assignee ? { id: assignee.id, name: assignee.name, email: assignee.email } : null,
        creator: creator ? { id: creator.id, name: creator.name } : null,
      };
    }

    const task = await this.db.task.findUnique({
      where: { id },
      include: {
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(dto: any, creatorId: string) {
    const taskId = `task-${Date.now()}`;
    const taskData = {
      title: dto.title,
      description: dto.description || '',
      status: dto.status || 'PENDING',
      priority: dto.priority || 'MEDIUM',
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      projectId: dto.projectId,
      milestoneId: dto.milestoneId || null,
      assigneeId: dto.assigneeId || null,
    };

    if (this.db.isFallbackMode) {
      const newTask = {
        id: taskId,
        ...taskData,
        createdById: creatorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.db.tasks.push(newTask);
      return this.findOne(taskId);
    }

    const created = await this.db.task.create({
      data: {
        ...taskData,
        createdById: creatorId,
      },
    });
    return this.findOne(created.id);
  }

  async update(id: string, dto: any) {
    if (this.db.isFallbackMode) {
      const idx = this.db.tasks.findIndex(t => t.id === id);
      if (idx === -1) throw new NotFoundException('Task not found');

      const existing = this.db.tasks[idx];
      const updated = {
        ...existing,
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : existing.dueDate,
        updatedAt: new Date(),
      };
      this.db.tasks[idx] = updated;
      return this.findOne(id);
    }

    const data: any = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);

    const updated = await this.db.task.update({
      where: { id },
      data,
    });
    return this.findOne(updated.id);
  }

  async addComment(taskId: string, content: string, userId: string) {
    if (this.db.isFallbackMode) {
      // Validate task exists
      const task = this.db.tasks.find(t => t.id === taskId);
      if (!task) throw new NotFoundException('Task not found');

      const commentId = `comment-${Date.now()}`;
      const newComment = {
        id: commentId,
        taskId,
        userId,
        content,
        createdAt: new Date(),
      };
      this.db.comments.push(newComment);
      return newComment;
    }

    return this.db.taskComment.create({
      data: {
        taskId,
        userId,
        content,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }
}
