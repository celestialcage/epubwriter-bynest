import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

// epub 메타데이터 - EPUB 생성에 사용하는 최종값
export class ResolvedEpubMetaDto {
  title!: string;
  author!: string;
  publisher!: string;
  description!: string;
  language!: string;
}

// 실제 DB에 저장된 편집값
export class EpubMetaDto {
  title!: string;

  author!: string | null;
  publisher!: string | null;
  description!: string | null;
  language!: string | null;

  resolved!: ResolvedEpubMetaDto;
}

// epub 메타데이터
export class UpdateEpubMetaDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  author?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  publisher?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  // @ValidateIf((_, value) => value !== undefined) // undefined만 건너뜀, null은 검증
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string | null;
}
