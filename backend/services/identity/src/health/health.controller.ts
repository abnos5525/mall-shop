import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: 'Identity service health' })
  @ApiResponse({ status: 200 })
  getHealth() {
    return this.healthService.getHealth();
  }
}