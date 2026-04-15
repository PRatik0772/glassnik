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
  Req,
  UseGuards,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { UploadVideoDto } from './dto/upload-video.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateVideoDto) {
    return this.videoService.create(req.user.id, dto);
  }

  // POST /videos/upload — returns a signed GCS URL + video record id
  @Post('upload')
  requestUpload(@Req() req, @Body() dto: UploadVideoDto) {
    return this.videoService.requestUpload(req.user.id, dto);
  }

  // PATCH /videos/:id/confirm — owner calls this after upload completes
  @Patch(':id/confirm')
  confirmUpload(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.videoService.confirmUpload(id, req.user.id);
  }

  @Get()
  findAll(@Req() req) {
    return this.videoService.findAllByOwner(req.user.id);
  }

  // Ownership enforced: only owner can fetch their own video details
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.videoService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() dto: UpdateVideoDto,
  ) {
    return this.videoService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.videoService.remove(id, req.user.id);
  }
}
