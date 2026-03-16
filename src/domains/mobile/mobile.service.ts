import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { FeedQueryDto } from './dto/feed-query.dto';

@Injectable()
export class MobileService {
  constructor(private prisma: PrismaService) {}

  uploadVideo(userId: number) {
    return {
      userId,
      message: 'Mobile video upload initiated (capability: mobile.creator)',
      status: 'PENDING_UPLOAD',
    };
  }

  async getFeed(query: FeedQueryDto) {
    const limit = query.limit ?? 20;
    const cursor = query.cursor ? parseInt(query.cursor) : undefined;

    const where: any = { status: 'READY' };
    if (query.category) where.category = query.category;

    const orderBy = query.trending
      ? { viewCount: 'desc' as const }
      : { createdAt: 'desc' as const };

    const videos = await this.prisma.videoAsset.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where,
      orderBy,
      select: {
        id: true,
        muxPlaybackId: true,
        thumbnailUrl: true,
        place: true,
        city: true,
        country: true,
        category: true,
        viewCount: true,
        owner: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    });

    const hasMore = videos.length > limit;
    const data = hasMore ? videos.slice(0, limit) : videos;
    const nextCursor = hasMore ? String(data[data.length - 1].id) : null;

    return { data, nextCursor };
  }

  async search(q: string) {
    const term = q.trim();
    if (!term) return [];

    return this.prisma.videoAsset.findMany({
      take: 50,
      where: {
        status: 'READY',
        OR: [
          { place: { contains: term, mode: 'insensitive' } },
          { city: { contains: term, mode: 'insensitive' } },
          { country: { contains: term, mode: 'insensitive' } },
          { category: { contains: term, mode: 'insensitive' } },
          { owner: { is: { username: { contains: term, mode: 'insensitive' } } } },
          { owner: { is: { displayName: { contains: term, mode: 'insensitive' } } } },
        ],
      },
      orderBy: { viewCount: 'desc' },
      select: {
        id: true,
        muxPlaybackId: true,
        thumbnailUrl: true,
        place: true,
        city: true,
        country: true,
        category: true,
        viewCount: true,
        owner: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    });
  }
}
