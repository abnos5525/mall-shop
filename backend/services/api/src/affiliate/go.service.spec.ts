import { NotFoundException } from '@nestjs/common';
import { GoService } from './go.service';

describe('GoService', () => {
  const prisma = {
    offer: { findFirst: jest.fn() },
    outboundClick: { findUnique: jest.fn(), create: jest.fn() },
  };
  const service = new GoService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prefers affiliate URL when configured', async () => {
    prisma.offer.findFirst.mockResolvedValue({
      id: 'o1',
      slug: 'demo',
      status: 'PUBLISHED',
      affiliateUrl: 'https://aff.example/track',
      destinationUrl: 'https://shop.example/item',
    });
    prisma.outboundClick.findUnique.mockResolvedValue(null);
    prisma.outboundClick.create.mockResolvedValue({});

    const result = await service.resolveRedirect('demo', {
      hashPepper: 'pepper',
      ip: '1.1.1.1',
    });

    expect(result.redirectUrl).toBe('https://aff.example/track');
    expect(result.destinationKind).toBe('AFFILIATE');
    expect(result.recorded).toBe(true);
  });

  it('rejects unpublished offers', async () => {
    prisma.offer.findFirst.mockResolvedValue(null);
    await expect(service.resolveRedirect('missing', { hashPepper: 'pepper' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});