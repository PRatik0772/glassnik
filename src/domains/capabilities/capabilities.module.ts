import { Module } from '@nestjs/common';
import { CapabilitiesController } from './capabilities.controller';
import { CapabilitiesService } from './capabilities.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { AdminGuard } from '@/auth/guards/admin.guard';

@Module({
  imports: [PrismaModule],
  controllers: [CapabilitiesController],
  providers: [CapabilitiesService, AdminGuard],
})
export class CapabilitiesModule {}
