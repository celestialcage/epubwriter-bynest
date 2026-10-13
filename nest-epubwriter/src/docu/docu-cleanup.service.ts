import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Docu } from 'docu/docu.entity';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class DocuCleanupService {
  private readonly logger = new Logger(DocuCleanupService.name);

  constructor(
    @InjectRepository(Docu)
    private readonly docuRepository: Repository<Docu>,
  ) {}

  // TODO: 휴지통 정책 바뀐 거용적용

  // // 매일 새벽 00:00에 실행
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // async cleanupOldTrashDocuments() {
  //   this.logger.log('30일 지난 휴지통 문서 자동 정리 스케줄러 실행...');

  //   // 현재 시간 기준 30일 전 날짜 계산
  //   const thiryDaysAgo = new Date();
  //   thiryDaysAgo.setDate(thiryDaysAgo.getDate() - 30);

  //   // deletedAt이 30일 이전인 문서들 DB에서 영구 삭제
  //   const result = await this.docuRepository.delete({
  //     deletedAt: LessThan(thiryDaysAgo),
  //   });

  //   this.logger.log(
  //     `총 ${result.affected || 0}개의 오래된 휴지통 문서가 영구 삭제되었습니다.`,
  //   );
  // }
}
