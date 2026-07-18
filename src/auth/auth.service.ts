import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus, type User } from '../prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import type { RegisterDto, LoginDto } from './dto/auth.dto';
import type { RequestUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from './strategies/jwt.strategy';

const BCRYPT_ROUNDS = 10;

export interface AuthResult {
  token: string;
  user: RequestUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly settings: SettingsService,
  ) {}

  // Strip the password hash before a user object ever leaves the service.
  private sanitize(user: User): RequestUser {
    const { passwordHash: _passwordHash, ...safe } = user;
    return safe;
  }

  private issueToken(user: User): string {
    const payload: JwtPayload = { sub: user.id };
    return this.jwt.sign(payload);
  }

  // Register → create a PENDING member. Returns a token so the app can call
  // /auth/activate as the authenticated-but-pending user.
  async register(dto: RegisterDto): Promise<AuthResult> {
    const [emailTaken, usernameTaken] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: dto.email } }),
      this.prisma.user.findUnique({ where: { username: dto.username } }),
    ]);
    if (emailTaken) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }
    if (usernameTaken) {
      throw new ConflictException("Ce nom d'utilisateur est déjà pris.");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        username: dto.username,
        passwordHash,
        role: UserRole.MEMBER,
        status: UserStatus.PENDING,
        isActivated: false,
      },
    });

    return { token: this.issueToken(user), user: this.sanitize(user) };
  }

  // Login → authenticate by email OR username. Succeeds even for PENDING users
  // (the app routes them to activation); only invalid credentials 401.
  async login(dto: LoginDto): Promise<AuthResult> {
    const identifier = dto.identifier.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: dto.identifier.trim() }],
      },
    });
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides.');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Identifiants invalides.');
    }
    return { token: this.issueToken(user), user: this.sanitize(user) };
  }

  // Activate → compare submitted code against the CURRENT global code. On
  // match, flip to ACTIVE permanently and record which code was used (so a
  // later admin code change never affects this user). Already-active users are
  // a no-op success.
  async activate(userId: string, code: string): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Session invalide.');
    }
    if (user.status === UserStatus.ACTIVE) {
      return { token: this.issueToken(user), user: this.sanitize(user) };
    }

    const currentCode = await this.settings.getActivationCode();
    if (code.trim() !== currentCode) {
      throw new UnprocessableEntityException({
        code: 'INVALID_ACTIVATION_CODE',
        message: "Code d'activation incorrect.",
      });
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        status: UserStatus.ACTIVE,
        isActivated: true,
        activatedAt: new Date(),
        activationCodeUsed: currentCode,
      },
    });
    return { token: this.issueToken(updated), user: this.sanitize(updated) };
  }

  async me(userId: string): Promise<RequestUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Session invalide.');
    }
    return this.sanitize(user);
  }
}
