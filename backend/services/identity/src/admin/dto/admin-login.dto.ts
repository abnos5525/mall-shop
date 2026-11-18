import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@dropclub.local' })
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({ description: 'Required when TOTP is enabled' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  totpCode?: string;

  @ApiPropertyOptional({ description: 'One-time recovery code' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  recoveryCode?: string;
}