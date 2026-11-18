import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { PublicOfferListResponse, PublicOfferDetail } from '@mall-shop/contracts';
import type { OffersService } from './offers.service';
import type { ListOffersQueryDto } from './dto/list-offers-query.dto';

@ApiTags('offers')
@Controller('offers')
export class PublicOffersController {
  constructor(private readonly offers: OffersService) {}

  @Get()
  @ApiOperation({ summary: 'List published offers (cursor pagination)' })
  @ApiOkResponse({ description: 'Published, non-expired offers' })
  list(@Query() query: ListOffersQueryDto): Promise<PublicOfferListResponse> {
    return this.offers.listPublicOffers(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Offer detail by slug (public)' })
  @ApiOkResponse({ description: 'Published offer detail' })
  detail(@Param('slug') slug: string): Promise<PublicOfferDetail> {
    return this.offers.getPublicOfferBySlug(slug);
  }
}