import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restoreTrashApi } from "../../services/trash";
import { queryKeys } from "../../services/queryKeys";
import type { TrashItem } from "../../types/types";
import { useState } from "react";
import { contextOf, findParentRoot, KIND_STYLE } from "./trashUtils";
import { ApiError } from "../../services/client";
import { formatDateTime, formatRelative } from "../../lib/date";
import { AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import PurgeConfirmModal from "./PurgeConfirmModal";

/* 복원과 영구 삭제 mutation을 행마다 따로 가지게 함. 
페이지에 하나만 두면 한 줄을 복원하는 동안 모든 줄의 버튼이 같이 로딩 상태가 되니깐. */
function useRestoreTrash() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreTrashApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trash });
      queryClient.invalidateQueries({ queryKey: queryKeys.library });
      queryClient.invalidateQueries({ queryKey: queryKeys.allChapters });
    },
  });
}

interface Props {
  item: TrashItem;
  allItems: TrashItem[];
}

export default function TrashRow({ item, allItems }: Props) {
  const [isConfirmingPurge, setIsConfirmingPurge] = useState(false);
  const restore = useRestoreTrash();
  const restoreParent = useRestoreTrash();

  const style = KIND_STYLE[item.kind];
  const Icon = style.icon;

  const isBlockedByParent =
    restore.error instanceof ApiError && restore.error.status === 409;
  const parentRoot = isBlockedByParent
    ? findParentRoot(item, allItems)
    : undefined;

  const handleRestoreParent = () => {
    if (!parentRoot) return;
    restoreParent.mutate(parentRoot.deletedGroupId, {
      onSuccess: () => restore.reset(), // 상위가 돌아왔으니 이전 409 안내는 지움
    });
  };

  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${style.box}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">
            {item.title}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {contextOf(item)} ·{" "}
            <span title={formatDateTime(item.deletedAt)}>
              {formatRelative(item.deletedAt)} 삭제
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => restore.mutate(item.deletedGroupId)}
            disabled={restore.isPending}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm transition disabled:opacity-50"
          >
            {restore.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>복원</span>
          </button>
          <button
            onClick={() => setIsConfirmingPurge(true)}
            className="px-2.5 py-1.5 text-xs font-medium text-red-600 rounded-md hover:bg-red-50 transition"
          >
            영구 삭제
          </button>
        </div>
      </div>

      {/* 복원 실패 안내 */}
      {restore.error && (
        <div className="mt-2 ml-11 flex flex-wrap items-center gap-2 px-2.5 py-1.5 bg-amber-50 border border-amber-200/60 rounded-md text-xs text-amber-700">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {isBlockedByParent ? (
            parentRoot ? (
              <>
                <span>
                  상위 {KIND_STYLE[parentRoot.kind].label} "{parentRoot.title}
                  "이(가) 휴지통에 있어요.
                </span>
                <button
                  onClick={handleRestoreParent}
                  disabled={restoreParent.isPending}
                  className="font-semibold underline underline-offset-2 hover:text-amber-900"
                >
                  {restoreParent.isPending
                    ? "복원 중..."
                    : `${KIND_STYLE[parentRoot.kind].label} 먼저 복원`}
                </button>
              </>
            ) : (
              <span>
                상위 항목이 휴지통에 있어요. 상위 항목을 먼저 복원해 주세요.
              </span>
            )
          ) : (
            <span>{restore.error.message}</span>
          )}
        </div>
      )}

      {isConfirmingPurge && (
        <PurgeConfirmModal
          item={item}
          allItems={allItems}
          onClose={() => setIsConfirmingPurge(false)}
        />
      )}
    </li>
  );
}
