import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { AdminGuard } from '@/auth/guards/admin.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, AdminGuard],
})
export class ApplicationsModule {}
