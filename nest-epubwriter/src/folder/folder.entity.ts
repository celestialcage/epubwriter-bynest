import { Docu } from 'docu/docu.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FolderKind {
  SERIES = 'series',
  BOOK = 'book',
  CHAPTER = 'chapter',
}

@Index(['userId', 'parentId', 'sortOrder']) // 1단: WHERE userId = ? AND parentId IS NULL
@Index(['parentId', 'sortOrder']) // 하위 목록: WHERE parentId = ?
@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'simple-enum', enum: FolderKind })
  kind!: FolderKind;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  // 부모 (시리즈 아래 책, 책 아래 챕터). 최상위면 null
  @Column({ type: 'int', nullable: true })
  parentId!: number | null;

  @ManyToOne(() => Folder, (folder) => folder.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: Folder | null;

  @OneToMany(() => Folder, (folder) => folder.parent)
  children?: Folder[];

  @OneToMany(() => Docu, (docu) => docu.chapter)
  documents?: Docu[];

  // ── EPUB 메타데이터 series, book 사용 (book은 series 값 상속) ──
  @Column({ type: 'varchar', length: 100, nullable: true })
  author!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  publisher!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  language!: string | null;

  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  // user도 ManyToOne - 인증 기능 생기면 추가
  // @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  // @JoinColumn({ name: 'userId' })
  // user?: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  deletedGroupId!: string | null;
}
