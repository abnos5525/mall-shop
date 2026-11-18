import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateDemandRequestDto {
  @ApiProperty()
  @IsString()
  @MaxLength(64)
  categoryId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  relatedOfferId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/)
  budgetAmount?: string;

  @ApiPropertyOptional({ default: 'IRR' })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  budgetCurrency?: string;

  @ApiProperty({ description: 'User must explicitly consent to share this request' })
  @IsBoolean()
  @Equals(true)
  consent!: boolean;
}