import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

export interface JwtPayload {
  sub: string;
}

// Resolves the CURRENT user from the DB on every request (not from token
// claims). This is deliberate: a user who registered (PENDING) and then
// activated keeps the same token, and their access must flip to ACTIVE
// immediately — so status/role are always read fresh from the DB, never
// trusted from the (possibly stale) token payload.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'dev-secret-change-me',
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('Session invalide.');
    }
    const { passwordHash: _passwordHash, ...safe } = user;
    return safe;
  }
}
