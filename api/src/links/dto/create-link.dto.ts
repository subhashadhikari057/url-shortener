import { IsDateString, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateLinkDto {
  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  @Length(3, 20)
  slug?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
