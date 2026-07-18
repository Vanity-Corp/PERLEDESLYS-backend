import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User } from '../../prisma/client';

// The user the JwtStrategy resolved from the DB for this request, minus the
// password hash. Injected with @CurrentUser() into guarded controllers.
export type RequestUser = Omit<User, 'passwordHash'>;

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    return request.user;
  },
);
