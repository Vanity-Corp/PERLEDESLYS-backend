import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { SettingsService } from './settings.service';

const updateActivationCodeSchema = z.object({
  activationCode: z.string().trim().min(1, "Le code d'activation est requis."),
});

// Admin-only. The dashboard's "Accès" settings panel reads/writes the global
// activation code here (BACKEND_PLAN.md Task 4.3).
@Controller('settings')
@UseGuards(JwtAuthGuard, AdminGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('activation-code')
  async getActivationCode() {
    const s = await this.settings.getSettings();
    return { activationCode: s.activationCode, updatedAt: s.updatedAt };
  }

  @Put('activation-code')
  async setActivationCode(
    @Body(new ZodValidationPipe(updateActivationCodeSchema))
    body: { activationCode: string },
  ) {
    const s = await this.settings.setActivationCode(body.activationCode);
    return { activationCode: s.activationCode, updatedAt: s.updatedAt };
  }
}
