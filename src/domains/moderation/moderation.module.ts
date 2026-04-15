import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { AdminGuard } from '@/auth/guards/admin.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ModerationController],
  providers: [ModerationService, AdminGuard],
})
export class ModerationModule {}
