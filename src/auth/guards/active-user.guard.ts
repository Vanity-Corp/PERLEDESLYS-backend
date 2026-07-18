import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserStatus } from '../../prisma/client';
import type { RequestUser } from '../../common/decorators/current-user.decorator';

// Denies access to PENDING accounts. The native app reads the `ACCOUNT_PENDING`
// code to route the user to the Activation screen. Must run AFTER JwtAuthGuard
// (it relies on req.user being populated by JwtStrategy).
@Injectable()
export class ActiveUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: RequestUser }>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException({
        code: 'ACCOUNT_PENDING',
        message: "Votre compte est en attente d'activation.",
      });
    }
    return true;
  }
}
