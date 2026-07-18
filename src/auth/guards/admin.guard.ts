import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '../../prisma/client';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

// Restricts a route to ADMIN users (the dashboard/back-office). Run after
// JwtAuthGuard. The native app's members are role MEMBER and are rejected here.
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: RequestUser }>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Accès réservé aux administrateurs.');
    }
    return true;
  }
}
