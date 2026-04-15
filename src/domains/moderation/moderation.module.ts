import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { ModerationProcessor } from './moderation.processor';
import { PrismaModule } from '@/prisma/prisma.module';
import { AdminGuard } from '@/auth/guards/admin.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ModerationController],
  providers: [ModerationService, ModerationProcessor, AdminGuard],
})
export class ModerationModule {}
