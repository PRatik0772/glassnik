import { Test } from '@nestjs/testing';
import { MobileService } from './mobile.service';
import { PrismaService } from '@/prisma/prisma.service';

const mockPrisma = {
  videoAsset: { findMany: jest.fn() },
};

describe('MobileService', () => {
  let service: MobileService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MobileService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(MobileService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFeed', () => {
    it('filters by category when provided', async () => {
      mockPrisma.videoAsset.findMany.mockResolvedValue([]);
      await service.getFeed({ category: 'street-scenes' });
      expect(mockPrisma.videoAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'street-scenes' }),
        }),
      );
    });

    it('sorts by viewCount DESC when trending=true', async () => {
      mockPrisma.videoAsset.findMany.mockResolvedValue([]);
      await service.getFeed({ trending: true });
      expect(mockPrisma.videoAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { viewCount: 'desc' } }),
      );
    });

    it('sorts by createdAt DESC by default', async () => {
      mockPrisma.videoAsset.findMany.mockResolvedValue([]);
      await service.getFeed({});
      expect(mockPrisma.videoAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });

    it('sets nextCursor when results exceed limit', async () => {
      const limit = 20;
      const mockItem = (id: number) => ({
        id,
        muxPlaybackId: `playback-${id}`,
        thumbnailUrl: `https://example.com/thumb-${id}.jpg`,
        place: 'Test Place',
        city: 'Test City',
        country: 'Test Country',
        category: 'street-scenes',
        viewCount: 0,
        owner: { id: 1, username: 'testuser', displayName: 'Test User', avatarUrl: null },
      });
      // Return limit + 1 items to trigger hasMore
      const items = Array.from({ length: limit + 1 }, (_, i) => mockItem(i + 1));
      mockPrisma.videoAsset.findMany.mockResolvedValue(items);

      const result = await service.getFeed({ limit });

      expect(result.data).toHaveLength(limit);
      expect(result.nextCursor).toBe(String(result.data[result.data.length - 1].id));
    });

    it('sets nextCursor to null when results are at or under limit', async () => {
      const limit = 20;
      const mockItem = (id: number) => ({
        id,
        muxPlaybackId: `playback-${id}`,
        thumbnailUrl: `https://example.com/thumb-${id}.jpg`,
        place: 'Test Place',
        city: 'Test City',
        country: 'Test Country',
        category: 'street-scenes',
        viewCount: 0,
        owner: { id: 1, username: 'testuser', displayName: 'Test User', avatarUrl: null },
      });
      // Return exactly limit items — no next page
      const items = Array.from({ length: limit }, (_, i) => mockItem(i + 1));
      mockPrisma.videoAsset.findMany.mockResolvedValue(items);

      const result = await service.getFeed({ limit });

      expect(result.data).toHaveLength(limit);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('search', () => {
    it('queries across place, city, country, category, username, and displayName', async () => {
      mockPrisma.videoAsset.findMany.mockResolvedValue([]);
      await service.search('bangkok');
      expect(mockPrisma.videoAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { place: { contains: 'bangkok', mode: 'insensitive' } },
              { city: { contains: 'bangkok', mode: 'insensitive' } },
              { country: { contains: 'bangkok', mode: 'insensitive' } },
              { category: { contains: 'bangkok', mode: 'insensitive' } },
              { owner: { is: { username: { contains: 'bangkok', mode: 'insensitive' } } } },
              { owner: { is: { displayName: { contains: 'bangkok', mode: 'insensitive' } } } },
            ]),
          }),
        }),
      );
    });

    it('returns empty array for blank query', async () => {
      const result = await service.search('  ');
      expect(result).toEqual([]);
      expect(mockPrisma.videoAsset.findMany).not.toHaveBeenCalled();
    });
  });
});
