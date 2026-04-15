import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { MeCapabilitiesController } from './me-capabilities.controller';
import { UserService } from './user.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController, MeCapabilitiesController],
  providers: [UserService],
})
export class UserModule {}
