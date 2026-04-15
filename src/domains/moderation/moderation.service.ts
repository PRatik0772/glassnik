import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ModerationStatus } from '@prisma/client';

@Injectable()
export class ModerationService {
  constructor(private prisma: PrismaService) {}

  // --- User-facing: file a report on a video ---
  async createReport(
    reporterId: number,
    videoId: number,
    reason: string,
    details?: string,
  ) {
    const video = await this.prisma.videoAsset.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException(`Video #${videoId} not found`);

    return this.prisma.moderationReport.create({
      data: { videoId, reporterId, reason, details },
    });
  }

  // --- Admin: get moderation queue (videos pending review) ---
  getQueue(status?: ModerationStatus) {
    return this.prisma.videoAsset.findMany({
      where: { moderationStatus: status ?? ModerationStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        title: true,
        moderationStatus: true,
        moderationNote: true,
        createdAt: true,
        owner: { select: { id: true, email: true, username: true } },
        moderationReports: {
          select: { reason: true, details: true, createdAt: true },
        },
      },
    });
  }

  // --- Admin: approve or reject a video ---
  async takeAction(
    videoId: number,
    moderatorId: number,
    action: ModerationStatus,
    note?: string,
  ) {
    if (
      action !== ModerationStatus.APPROVED &&
      action !== ModerationStatus.REJECTED &&
      action !== ModerationStatus.TAKEDOWN
    ) {
      throw new BadRequestException(
        'Action must be APPROVED, REJECTED, or TAKEDOWN',
      );
    }

    const video = await this.prisma.videoAsset.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException(`Video #${videoId} not found`);

    const [updated] = await this.prisma.$transaction([
      this.prisma.videoAsset.update({
        where: { id: videoId },
        data: { moderationStatus: action, moderationNote: note ?? null },
      }),
      this.prisma.moderationAction.create({
        data: { videoId, moderatorId, action, note },
      }),
    ]);

    return updated;
  }

  // --- Admin: get action history for a video ---
  getHistory(videoId: number) {
    return this.prisma.moderationAction.findMany({
      where: { videoId },
      orderBy: { createdAt: 'desc' },
      include: {
        moderator: { select: { id: true, username: true, displayName: true } },
      },
    });
  }

  // --- Admin: get all reports for a video ---
  getReports(videoId: number) {
    return this.prisma.moderationReport.findMany({
      where: { videoId },
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, username: true } },
      },
    });
  }
}
