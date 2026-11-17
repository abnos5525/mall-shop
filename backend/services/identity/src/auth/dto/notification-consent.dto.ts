import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class NotificationConsentDto {
  @ApiProperty()
  @IsBoolean()
  granted!: boolean;
}