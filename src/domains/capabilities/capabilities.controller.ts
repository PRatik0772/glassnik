import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CapabilitiesService } from './capabilities.service';
import { CreateCapabilityDto } from './dto/create-capability.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@/auth/guards/admin.guard';

@Controller('capabilities')
export class CapabilitiesController {
  constructor(private readonly capabilitiesService: CapabilitiesService) {}

  // Public: list all capabilities
  @Get()
  listAll() {
    return this.capabilitiesService.listAll();
  }

  // Admin only: create a new capability definition
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  createCapability(@Body() dto: CreateCapabilityDto) {
    return this.capabilitiesService.createCapability(dto);
  }
}
