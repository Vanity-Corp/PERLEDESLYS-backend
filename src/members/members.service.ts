import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole, UserStatus, type User } from '../prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../common/decorators/current-user.decorator';

// Admin-facing management of native-app members (role MEMBER). See
// BACKEND_PLAN.md Task 4.2. The dashboard's Members page consumes this.
@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  private sanitize(user: User): RequestUser {
    const { passwordHash: _passwordHash, ...safe } = user;
    return safe;
  }

  async list(status?: string, search?: string): Promise<RequestUser[]> {
    const where: Prisma.UserWhereInput = { role: UserRole.MEMBER };

    if (
      status &&
      (Object.values(UserStatus) as string[]).includes(status)
    ) {
      where.status = status as UserStatus;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { username: { contains: q, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => this.sanitize(u));
  }

  // Admins can only toggle between ACTIVE (grant) and SUSPENDED (revoke) — they
  // can't push a user back to PENDING (that's the pre-activation state).
  async setStatus(
    id: string,
    status: typeof UserStatus.ACTIVE | typeof UserStatus.SUSPENDED,
  ): Promise<RequestUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== UserRole.MEMBER) {
      throw new NotFoundException('Membre introuvable.');
    }
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        status,
        // Reactivating an account also (re)marks it activated.
        isActivated: status === UserStatus.ACTIVE ? true : user.isActivated,
      },
    });
    return this.sanitize(updated);
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== UserRole.MEMBER) {
      throw new NotFoundException('Membre introuvable.');
    }
    await this.prisma.user.delete({ where: { id } });
  }
}
