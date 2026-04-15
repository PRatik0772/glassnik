import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { UploadVideoDto } from './dto/upload-video.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  // GET /videos/nearby — public, no JWT needed
  @Get('nearby')
  getNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius = '50',
    @Query('limit') limit = '20',
  ) {
    return this.videoService.getNearby(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius),
      parseInt(limit, 10),
    );
  }

  // All routes below require JWT
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req, @Body() dto: CreateVideoDto) {
    return this.videoService.create(req.user.id, dto);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  requestUpload(@Req() req, @Body() dto: UploadVideoDto) {
    return this.videoService.requestUpload(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req) {
    return this.videoService.findAllByOwner(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.videoService.findOne(id, req.user.id);
  }

  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard)
  confirmUpload(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.videoService.confirmUpload(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() dto: UpdateVideoDto,
  ) {
    return this.videoService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.videoService.remove(id, req.user.id);
  }
}
