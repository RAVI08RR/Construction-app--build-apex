import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private db: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key-for-construction-saas-2026-development',
    });
  }

  async validate(payload: any) {
    if (this.db.isFallbackMode) {
      const user = this.db.users.find(u => u.id === payload.sub);
      if (!user) throw new UnauthorizedException('User not found in memory database');
      return { id: user.id, email: user.email, tenantId: user.tenantId, name: user.name, role: user.role };
    }

    const user = await this.db.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, tenantId: true, name: true, role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
