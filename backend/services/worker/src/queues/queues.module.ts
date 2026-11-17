import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SystemPingProcessor } from './system-ping.processor';
import { SYSTEM_PING_QUEUE } from './queue-names';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
        },
      }),
    }),
    BullModule.registerQueue({ name: SYSTEM_PING_QUEUE }),
  ],
  providers: [SystemPingProcessor],
})
export class QueuesModule {}