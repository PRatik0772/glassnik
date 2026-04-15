import { IsIn, IsInt, IsOptional, IsString, Length, Max } from 'class-validator';

const ALLOWED_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MAX_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

export class UploadVideoDto {
  @IsString()
  @IsIn(ALLOWED_MIME_TYPES, {
    message: `mimeType must be one of: ${ALLOWED_MIME_TYPES.join(', ')}`,
  })
  mimeType: string;

  @IsInt()
  @Max(MAX_SIZE_BYTES, { message: 'File size must not exceed 500 MB' })
  sizeBytes: number;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
