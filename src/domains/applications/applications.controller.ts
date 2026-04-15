import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@/auth/guards/admin.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // Any authenticated user can submit a capability application
  @Post()
  create(@Req() req, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(req.user.id, dto);
  }

  // Admin only: list all applications (optionally filtered by status)
  @Get()
  @UseGuards(AdminGuard)
  findAll(@Query('status') status?: string) {
    return this.applicationsService.findAll(status);
  }

  // Admin only: view a single application
  @Get(':id')
  @UseGuards(AdminGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.applicationsService.findOne(id);
  }

  // Admin only: approve or reject an application
  @Patch(':id/review')
  @UseGuards(AdminGuard)
  review(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() dto: ReviewApplicationDto,
  ) {
    return this.applicationsService.review(id, req.user.id, dto);
  }
}
