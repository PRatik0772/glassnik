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
