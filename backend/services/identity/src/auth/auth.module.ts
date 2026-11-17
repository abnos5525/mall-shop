import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { InitDataReplayService } from './replay/init-data-replay.service';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { SessionService } from './session/session.service';
import { InternalSessionsController } from '../internal/internal-sessions.controller';
import { InternalServiceGuard } from '../internal/guards/internal-service.guard';
import { ConsentService } from './consent/consent.service';

@Module({
  controllers: [AuthController, InternalSessionsController],
  providers: [
    AuthService,
    SessionService,
    ConsentService,
    InitDataReplayService,
    SessionAuthGuard,
    InternalServiceGuard,
  ],
  exports: [AuthService, SessionService],
})
export class AuthModule {}