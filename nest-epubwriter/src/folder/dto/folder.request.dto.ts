import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

// ==========================================
// 1. CREATE DTO
// ==========================================

export class CreateSeriesDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: '시리즈명을 입력해주세요.' })
  @MaxLength(50, { message: '시리즈명은 최대 50자까지 입력 가능합니다.' })
  title!: string;
}

export class CreateBookDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: '책 이름을 입력해주세요.' })
  @MaxLength(50, { message: '책 이름은 최대 50자까지 입력 가능합니다.' })
  title!: string;

  @IsOptional()
  @IsInt()
  parentSeriesId?: number | null;
}

export class CreateChapterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: '챕터 이름을 입력해주세요.' })
  @MaxLength(50, { message: '챕터 이름은 최대 50자까지 입력 가능합니다.' })
  title!: string;

  @IsInt()
  parentBookId!: number;
}

// ==========================================
// 2. EPUB METADATA DTO
// ==========================================

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

  @ValidateIf((_, value) => value !== undefined) // undefined만 건너뜀, null은 검증
  @IsString()
  @MaxLength(10)
  language?: string;
}

// ==========================================
// 3. UPDATE DTO
// ==========================================

export class UpdateFolderDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: '폴더명을 입력해주세요.' })
  @MaxLength(50, { message: '폴더명은 최대 50자까지 입력 가능합니다.' })
  title!: string;
}

export class UpdateSeriesDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MinLength(1, { message: '시리즈명을 입력해주세요.' })
  @MaxLength(50, { message: '시리즈명은 최대 50자까지 입력 가능합니다.' })
  title?: string;

  // @IsOptional()
  // @IsInt()
  // sortOrder?: number;
}

export class UpdateBookDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MinLength(1, { message: '책 이름을 입력해주세요.' })
  @MaxLength(50, { message: '책 이름은 최대 50자까지 입력 가능합니다.' })
  title?: string;

  // @IsOptional()
  // @IsInt()
  // sortOrder?: number;

  // @IsOptional()
  // @IsInt()
  // parentId?: number | null;

  // 중첩 객체(Nested Object) 검증 필수 설정
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEpubMetaDto)
  epubMetadata?: UpdateEpubMetaDto;
}

export class UpdateChapterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsOptional()
  @MinLength(1, { message: '챕터 이름을 입력해주세요.' })
  @MaxLength(50, { message: '챕터 이름은 최대 50자까지 입력 가능합니다.' })
  title?: string;

  // @IsInt()
  // @IsOptional()
  // sortOrder?: number;

  // @IsInt()
  // @IsOptional()
  // parentId?: number;
}
