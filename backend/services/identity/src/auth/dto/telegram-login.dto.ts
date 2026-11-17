import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TelegramLoginDto {
  @ApiProperty({
    description: 'Raw Telegram WebApp initData string (never initDataUnsafe JSON).',
    example: 'query_id=...&user=...&auth_date=...&hash=...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  initData!: string;
}