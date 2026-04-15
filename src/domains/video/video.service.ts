import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { GcpService } from '@/gcp.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { UploadVideoDto } from './dto/upload-video.dto';

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

  // GET /videos/nearby — haversine distance filter in-DB via raw query
  async getNearby(lat: number, lng: number, radiusKm: number, limit: number) {
    if (isNaN(lat) || isNaN(lng)) return [];

    // Use a bounding box pre-filter then sort by distance
    const latDelta = radiusKm / 111.0;
    const lngDelta = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));

    return this.prisma.videoAsset.findMany({
      where: {
        moderationStatus: 'APPROVED',
        status: 'READY',
        latitude: { gte: lat - latDelta, lte: lat + latDelta },
        longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, muxPlaybackId: true, thumbnailUrl: true,
        place: true, city: true, country: true, category: true, viewCount: true,
        latitude: true, longitude: true,
        owner: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });
  }

  // Step 1: create the video record + return a signed GCS upload URL
  async requestUpload(ownerId: number, dto: UploadVideoDto) {
    const gcsPath = `uploads/${ownerId}/${Date.now()}.${dto.mimeType.split('/')[1]}`;

    const video = await this.prisma.videoAsset.create({
      data: {
        ownerId,
        title: dto.title,
        description: dto.description,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        gcsPath,
        source: 'mobile',
        status: 'UPLOADING',
      },
    });

    const uploadUrl = await this.gcpService.getSignedUploadUrl(gcsPath, dto.mimeType);

    return { videoId: video.id, uploadUrl, expiresInMinutes: 15 };
  }

  // Step 2: owner calls this after the client finishes uploading to GCS
  async confirmUpload(id: number, ownerId: number) {
    const video = await this.prisma.videoAsset.findFirst({
      where: { id, ownerId },
    });

    if (!video) {
      throw new NotFoundException(`Video #${id} not found or access denied`);
    }

    return this.prisma.videoAsset.update({
      where: { id },
      data: {
        status: 'UPLOADED',
        publicUrl: this.gcpService.getPublicUrl(video.gcsPath!),
        // moderationStatus stays PENDING — moderation pipeline picks it up from here
      },
    });
  }
}
