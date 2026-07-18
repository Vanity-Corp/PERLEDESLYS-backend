import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UserStatus } from '../prisma/client';
import { MembersService } from './members.service';

// Admin-only. Backs the dashboard Members page (BACKEND_PLAN.md Task 4.2).
const setStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});

@Controller('admin/members')
@UseGuards(JwtAuthGuard, AdminGuard)
export class MembersController {
  constructor(private readonly members: MembersService) {}

  @Get()
  list(@Query('status') status?: string, @Query('search') search?: string) {
    return this.members.list(status, search);
  }

  @Patch(':id')
  setStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(setStatusSchema))
    body: { status: typeof UserStatus.ACTIVE | typeof UserStatus.SUSPENDED },
  ) {
    return this.members.setStatus(id, body.status);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.members.remove(id);
  }
}
