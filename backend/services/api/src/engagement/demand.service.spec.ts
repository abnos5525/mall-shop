import { BadRequestException } from '@nestjs/common';
import { DemandService } from './demand.service';

describe('DemandService', () => {
  const prisma = {
    category: { findFirst: jest.fn() },
    offer: { findFirst: jest.fn() },
    demandRequest: { count: jest.fn(), create: jest.fn() },
  };
  const service = new DemandService(prisma as never);

  it('requires explicit consent', async () => {
    await expect(
      service.create('sub', {
        categoryId: 'tech',
        description: 'need vpn',
        consent: false,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});