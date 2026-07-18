import { Injectable } from '@nestjs/common';
import type { AppSettings } from '../prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// AppSettings is a singleton row. The activation code lives here (never
// hardcoded). Changing it only affects FUTURE activations — see AuthService.
const DEFAULT_ACTIVATION_CODE = 'WELCOME2026';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Returns the singleton, creating it with a default code on first access so
  // the system is never in a "no settings row" state.
  async getSettings(): Promise<AppSettings> {
    const existing = await this.prisma.appSettings.findFirst();
    if (existing) {
      return existing;
    }
    return this.prisma.appSettings.create({
      data: { activationCode: DEFAULT_ACTIVATION_CODE },
    });
  }

  async getActivationCode(): Promise<string> {
    const settings = await this.getSettings();
    return settings.activationCode;
  }

  async setActivationCode(activationCode: string): Promise<AppSettings> {
    const current = await this.getSettings();
    return this.prisma.appSettings.update({
      where: { id: current.id },
      data: { activationCode: activationCode.trim() },
    });
  }
}
