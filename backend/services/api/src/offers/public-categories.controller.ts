import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { OffersService } from './offers.service';

@ApiTags('categories')
@Controller('categories')
export class PublicCategoriesController {
  constructor(private readonly offers: OffersService) {}

  @Get()
  @ApiOperation({ summary: 'List active categories (public)' })
  @ApiOkResponse({ description: 'Active categories ordered by sortOrder' })
  list() {
    return this.offers.listPublicCategories();
  }
}