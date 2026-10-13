import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { TrashItemDto } from 'trash/dto/trash.response.dto';
import { TrashService } from 'trash/trash.service';

// 임시 username
const userId = 'shabet';

@Controller('trash')
export class TrashController {
  constructor(private readonly trashService: TrashService) {}

  // 휴지통 목록
  @Get()
  async getTrashItems(
    /* @CurrentUser() userId: string */
  ): Promise<TrashItemDto[]> {
    return this.trashService.getTrashItems(userId);
  }

  // 복구
  @Post(':groupId/restore')
  @HttpCode(204)
  async restore(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    /* @CurrentUser() userId: string */
  ): Promise<void> {
    return this.trashService.restoreGroup(groupId, userId);
  }

  // 영구 삭제
  @Delete(':groupId')
  @HttpCode(204)
  async hardDelete(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    /* @CurrentUser() userId: string */
  ): Promise<void> {
    return this.trashService.hardDeleteGroup(groupId, userId);
  }
}
