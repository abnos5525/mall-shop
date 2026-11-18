import { Controller, Delete, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BearerSessionGuard, type VerifiedRequest } from '../identity/guards/bearer-session.guard';
import type { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('me/favorites')
@UseGuards(BearerSessionGuard)
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'List current user favorites' })
  list(@Req() request: VerifiedRequest) {
    return this.favorites.list(request.identity!.subjectId);
  }

  @Post(':offerId')
  @ApiOperation({ summary: 'Add offer to favorites' })
  add(@Req() request: VerifiedRequest, @Param('offerId') offerId: string) {
    return this.favorites.add(request.identity!.subjectId, offerId);
  }

  @Delete(':offerId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove offer from favorites' })
  async remove(@Req() request: VerifiedRequest, @Param('offerId') offerId: string) {
    await this.favorites.remove(request.identity!.subjectId, offerId);
  }
}