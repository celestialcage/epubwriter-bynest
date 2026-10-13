import { Folder } from 'folder/folder.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index(['chapterId', 'sortOrder'])
@Entity('documents')
export class Docu {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  content!: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'int' })
  chapterId!: number;

  @ManyToOne(() => Folder, (chapter) => chapter.documents, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chapterId' })
  chapter?: Folder;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // 👈 deletedAt이 null이면 정상, 값이 있으면 휴지통에 있는 상태
  @DeleteDateColumn()
  deletedAt!: Date | null;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  deletedGroupId!: string | null;
}
