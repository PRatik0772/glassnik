import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ModerationStatus } from '@prisma/client';

/**
 * AI Moderation Processor
 *
 * Polls for videos in PENDING state and runs them through a simulated
 * AI content-safety pipeline:
 *
 *   PENDING → PROCESSING  (picked up by processor)
 *   PROCESSING → APPROVED (passed AI checks)
 *   PROCESSING → REJECTED (failed AI checks — flagged as unsafe)
 *
 * In production, replace the simulate() method with a real call to an
 * AI content-moderation API (e.g. Google Video Intelligence, AWS Rekognition,
 * or a custom model endpoint).
 */
@Injectable()
export class ModerationProcessor implements OnModuleInit {
  private readonly logger = new Logger(ModerationProcessor.name);
  private readonly POLL_INTERVAL_MS = 30_000; // check every 30 seconds
  private readonly PROCESSING_DELAY_MS = 8_000; // simulate 8s AI analysis

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.startPolling();
  }

  private startPolling() {
    setInterval(() => this.processBatch(), this.POLL_INTERVAL_MS);
    // Run once immediately on startup
    setTimeout(() => this.processBatch(), 2000);
  }

  private async processBatch() {
    // Pick up to 5 pending videos at a time
    const pending = await this.prisma.videoAsset.findMany({
      where: { moderationStatus: ModerationStatus.PENDING, status: 'UPLOADED' },
      take: 5,
      orderBy: { createdAt: 'asc' },
      select: { id: true, title: true, gcsPath: true, mimeType: true },
    });

    if (pending.length === 0) return;

    this.logger.log(`Processing ${pending.length} video(s) through AI moderation`);

    for (const video of pending) {
      await this.process(video.id, video.gcsPath ?? '');
    }
  }

  private async process(videoId: number, gcsPath: string) {
    // Mark as PROCESSING
    await this.prisma.videoAsset.update({
      where: { id: videoId },
      data: { moderationStatus: ModerationStatus.PROCESSING, status: 'PROCESSING' },
    });

    this.logger.log(`[AI] Video #${videoId} — analysing content...`);

    // Simulate async AI call
    await this.simulate(gcsPath);

    // Determine result — in production, parse the real API response
    const result = this.mockAiDecision(gcsPath);

    await this.prisma.$transaction([
      this.prisma.videoAsset.update({
        where: { id: videoId },
        data: {
          moderationStatus: result.approved ? ModerationStatus.APPROVED : ModerationStatus.REJECTED,
          moderationNote: result.note,
          status: result.approved ? 'READY' : 'REJECTED',
        },
      }),
      this.prisma.moderationAction.create({
        data: {
          videoId,
          moderatorId: 1, // system moderator user id
          action: result.approved ? ModerationStatus.APPROVED : ModerationStatus.REJECTED,
          note: `[AI] ${result.note}`,
        },
      }),
    ]);

    this.logger.log(
      `[AI] Video #${videoId} → ${result.approved ? 'APPROVED' : 'REJECTED'} — ${result.note}`,
    );
  }

  /** Simulate the AI processing delay */
  private simulate(_gcsPath: string): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.PROCESSING_DELAY_MS));
  }

  /**
   * Mock AI decision logic.
   * Replace this entirely with real content-safety API results in production.
   * Currently approves all videos except those whose path contains 'test_fail'.
   */
  private mockAiDecision(gcsPath: string): { approved: boolean; note: string } {
    if (gcsPath.includes('test_fail')) {
      return { approved: false, note: 'Flagged by AI: potentially unsafe content detected' };
    }
    return {
      approved: true,
      note: 'Passed AI content-safety checks: no violence, nudity, or harmful content detected',
    };
  }
}
