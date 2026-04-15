import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

// status and moderationStatus are intentionally excluded — only the moderation
// system can transition those fields, never the owner directly.
export class UpdateVideoDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  eligibleForStitch?: boolean;
}
