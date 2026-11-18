import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { BearerSessionGuard, type VerifiedRequest } from '../identity/guards/bearer-session.guard';
import type { DemandService } from './demand.service';
import type { CreateDemandRequestDto } from './dto/create-demand-request.dto';

@ApiTags('demand-requests')
@ApiBearerAuth()
@Controller('demand-requests')
@UseGuards(BearerSessionGuard)
export class DemandController {
  constructor(private readonly demand: DemandService) {}

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post()
  @ApiOperation({ summary: 'Submit purchase-intent request (consent required)' })
  create(@Req() request: VerifiedRequest, @Body() body: CreateDemandRequestDto) {
    return this.demand.create(request.identity!.subjectId, body);
  }

  @Get('mine')
  @ApiOperation({ summary: 'List own demand requests (minimal fields)' })
  listMine(@Req() request: VerifiedRequest) {
    return this.demand.listMine(request.identity!.subjectId);
  }
}