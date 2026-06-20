import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    if (this.db.isFallbackMode) {
      // 1. Check if user already exists
      const existingUser = this.db.users.find(u => u.email === dto.email);
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      // 2. Create Tenant
      const tenantId = `tenant-${Date.now()}`;
      const newTenant = {
        id: tenantId,
        name: dto.companyName,
        domain: dto.companyName.toLowerCase().replace(/\s+/g, '-'),
        plan: 'STARTER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.db.tenants.push(newTenant);

      // 3. Create Owner User
      const userId = `user-${Date.now()}`;
      const newUser = {
        id: userId,
        tenantId,
        email: dto.email,
        passwordHash,
        name: dto.fullName,
        role: 'OWNER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.db.users.push(newUser);

      // 4. Return token
      return this.generateAuthResponse(newUser);
    }

    // PostgreSQL Mode
    // 1. Check if user already exists
    const existingUser = await this.db.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // 2. Perform Transaction: Create Tenant and Owner
    const result = await this.db.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.companyName,
          domain: dto.companyName.toLowerCase().replace(/\s+/g, '-'),
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email,
          passwordHash,
          name: dto.fullName,
          role: 'OWNER',
        },
      });

      return user;
    });

    return this.generateAuthResponse(result);
  }

  async login(dto: LoginDto) {
    let user: any;

    if (this.db.isFallbackMode) {
      user = this.db.users.find(u => u.email === dto.email);
    } else {
      user = await this.db.user.findUnique({
        where: { email: dto.email },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      name: user.name,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }
}
