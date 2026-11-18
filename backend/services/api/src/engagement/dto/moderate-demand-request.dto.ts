import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

enum DemandStatusDto {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

export class ModerateDemandRequestDto {
  @ApiProperty({ enum: DemandStatusDto })
  @IsEnum(DemandStatusDto)
  status!: DemandStatusDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminNotes?: string;
}