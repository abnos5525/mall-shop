import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { HealthResponseDto } from './dto/health-response.dto';
import type { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: 'Service health and dependency checks' })
  @ApiResponse({ status: 200, type: HealthResponseDto })
  getHealth(): Promise<HealthResponseDto> {
    return this.healthService.getHealth();
  }
}