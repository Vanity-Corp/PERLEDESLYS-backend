import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Requires a valid JWT. Used alone on endpoints a PENDING user must still
// reach (activate, me); combined with ActiveUserGuard on feature routes.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
