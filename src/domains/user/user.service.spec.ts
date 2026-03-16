import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '@/prisma/prisma.service';

const mockPrisma = {
  user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  videoAsset: { count: jest.fn(), findMany: jest.fn() },
  userCapability: { findMany: jest.fn() },
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPublicProfile', () => {
    it('returns profile with videoCount, followerCount, and videos', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1, username: 'jason', displayName: 'Jason', avatarUrl: null, status: 'ACTIVE',
      });
      mockPrisma.videoAsset.count.mockResolvedValue(5);
      mockPrisma.videoAsset.findMany.mockResolvedValue([
        { id: 10, muxPlaybackId: 'abc', thumbnailUrl: null, place: 'Market', city: 'BKK', country: 'Thailand', category: 'food-markets', viewCount: 100 },
      ]);

      const result = await service.getPublicProfile(1);

      expect(result).toMatchObject({ videoCount: 5, followerCount: 0 });
      expect(result?.videos).toHaveLength(1);
      expect(result?.videos[0]).toEqual({
        id: 10, muxPlaybackId: 'abc', thumbnailUrl: null,
        place: 'Market', city: 'BKK', country: 'Thailand',
        category: 'food-markets', viewCount: 100,
      });
    });

    it('returns null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.getPublicProfile(999);
      expect(result).toBeNull();
    });
  });
});
