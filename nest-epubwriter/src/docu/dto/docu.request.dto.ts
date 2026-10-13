import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDocuRequest {
  @IsString()
  @MinLength(1, { message: '제목을 입력해주세요.' })
  @MaxLength(200, { message: '제목은 최대 200자까지 입력 가능합니다.' })
  title!: string;

  @IsString()
  @IsOptional() // 엔티티에서 nullable: true이므로 선택 항목으로 결정
  content?: string;

  @IsInt()
  @IsNotEmpty()
  chapterId!: number;
}

export class UpdateDocuRequest {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: '제목을 입력해주세요.' })
  @MaxLength(200, { message: '제목은 최대 200자까지 입력 가능합니다.' })
  title!: string;

  @IsOptional() // 엔티티에서 nullable: true이므로 선택 항목으로 결정
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  chapterId!: number | undefined;
}
