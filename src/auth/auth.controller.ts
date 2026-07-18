import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CurrentUser,
  type RequestUser,
} from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import {
  activateSchema,
  loginSchema,
  registerSchema,
  type ActivateDto,
  type LoginDto,
  type RegisterDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginDto) {
    return this.auth.login(dto);
  }

  // JWT required but NOT ActiveUserGuard — a PENDING user must be able to
  // activate. Reads the current user's id from the resolved token.
  @Post('activate')
  @UseGuards(JwtAuthGuard)
  activate(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(activateSchema)) dto: ActivateDto,
  ) {
    return this.auth.activate(user.id, dto.code);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: RequestUser) {
    return this.auth.me(user.id);
  }
}
