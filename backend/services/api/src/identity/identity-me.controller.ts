import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BearerSessionGuard, type VerifiedRequest } from './guards/bearer-session.guard';

@ApiTags('identity')
@Controller('me')
export class IdentityMeController {
  @Get()
  @UseGuards(BearerSessionGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Resolve current user subject via Identity service (requires Bearer access token)',
  })
  me(@Req() request: VerifiedRequest) {
    return request.identity;
  }
}