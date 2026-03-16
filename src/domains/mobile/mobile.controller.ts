import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CapabilitiesGuard, RequireCapabilities } from '@/auth/guards/capabilities.guard';
import { FeedQueryDto } from './dto/feed-query.dto';

@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Post('videos')
  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @RequireCapabilities('mobile.creator')
  uploadVideo(@Req() req) {
    return this.mobileService.uploadVideo(req.user.id);
  }

  @Get('feed')
  getFeed(@Query() query: FeedQueryDto) {
    return this.mobileService.getFeed(query);
  }

  @Get('search')
  search(@Query('q') q: string = '') {
    return this.mobileService.search(q);
  }
}
