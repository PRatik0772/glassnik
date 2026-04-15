import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { ModerationStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

class CreateReportDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  details?: string;
}

class TakeActionDto {
  @IsEnum(ModerationStatus)
  action: ModerationStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

@Controller('moderation')
@UseGuards(JwtAuthGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  // POST /moderation/reports/:videoId — any authenticated user can report
  @Post('reports/:videoId')
  report(
    @Param('videoId', ParseIntPipe) videoId: number,
    @Req() req,
    @Body() dto: CreateReportDto,
  ) {
    return this.moderationService.createReport(
      req.user.id,
      videoId,
      dto.reason,
      dto.details,
    );
  }

  // GET /moderation/queue?status=PENDING — admin only
  @Get('queue')
  @UseGuards(AdminGuard)
  getQueue(@Query('status') status?: ModerationStatus) {
    return this.moderationService.getQueue(status);
  }

  // POST /moderation/actions/:videoId — admin only
  @Post('actions/:videoId')
  @UseGuards(AdminGuard)
  takeAction(
    @Param('videoId', ParseIntPipe) videoId: number,
    @Req() req,
    @Body() dto: TakeActionDto,
  ) {
    return this.moderationService.takeAction(
      videoId,
      req.user.id,
      dto.action,
      dto.note,
    );
  }

  // GET /moderation/history/:videoId — admin only
  @Get('history/:videoId')
  @UseGuards(AdminGuard)
  getHistory(@Param('videoId', ParseIntPipe) videoId: number) {
    return this.moderationService.getHistory(videoId);
  }

  // GET /moderation/reports/:videoId — admin only
  @Get('reports/:videoId')
  @UseGuards(AdminGuard)
  getReports(@Param('videoId', ParseIntPipe) videoId: number) {
    return this.moderationService.getReports(videoId);
  }
}
