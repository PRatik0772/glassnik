import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { GcpService } from '@/gcp.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class VideoService {
  constructor(
    private prisma: PrismaService,
    private gcpService: GcpService,
  ) {}

  async create(ownerId: number, dto: CreateVideoDto) {
    const video = await this.prisma.videoAsset.create({
      data: {
        ownerId,
        title: dto.title,
        description: dto.description,
        source: dto.source || 'mobile',
        eligibleForStitch: dto.eligibleForStitch ?? false,
        status: 'UPLOADED',
        // moderationStatus defaults to PENDING via schema
      },
    });

    await this.prisma.user.update({
      where: { id: ownerId },
      data: { hasUploadedContent: true },
    });

    return video;
  }

  findAllByOwner(ownerId: number) {
    return this.prisma.videoAsset.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, requesterId: number) {
    const video = await this.prisma.videoAsset.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    });

    if (!video) throw new NotFoundException(`Video #${id} not found`);

    if (video.ownerId !== requesterId) {
      throw new ForbiddenException('You do not have access to this video');
    }

    return video;
  }

  async update(id: number, ownerId: number, dto: UpdateVideoDto) {
    const video = await this.prisma.videoAsset.findFirst({
      where: { id, ownerId },
    });

    if (!video) {
      throw new NotFoundException(`Video #${id} not found or access denied`);
    }

    // status and moderationStatus are not patchable by the owner — enforced via DTO
    return this.prisma.videoAsset.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        eligibleForStitch: dto.eligibleForStitch,
      },
    });
  }

  async remove(id: number, ownerId: number) {
    const video = await this.prisma.videoAsset.findFirst({
      where: { id, ownerId },
    });

    if (!video) {
      throw new NotFoundException(`Video #${id} not found or access denied`);
    }

    await this.prisma.videoAsset.delete({ where: { id } });
  }
}
