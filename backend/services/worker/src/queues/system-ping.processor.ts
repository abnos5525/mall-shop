import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { SYSTEM_PING_QUEUE } from './queue-names';

@Processor(SYSTEM_PING_QUEUE)
export class SystemPingProcessor extends WorkerHost {
  private readonly logger = new Logger(SystemPingProcessor.name);

  async process(job: Job<{ issuedAt: string }>): Promise<{ receivedAt: string }> {
    this.logger.debug({ jobId: job.id }, 'system ping processed');
    return { receivedAt: new Date().toISOString() };
  }
}