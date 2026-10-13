import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TrashItem } from "../../types/types";
import { findChildRoots, KIND_STYLE } from "./trashUtils";
import { purgeTrashApi } from "../../services/trash";
import { queryKeys } from "../../services/queryKeys";
import { AlertTriangle, Loader2 } from "lucide-react";
import Modal from "../common/Modal";

interface Props {
  item: TrashItem;
  allItems: TrashItem[];
  onClose: () => void;
}

export default function PurgeConfirmModal({ item, allItems, onClose }: Props) {
  const queryClient = useQueryClient();
  const childRoots = findChildRoots(item, allItems);
  const hasDescendants = item.kind !== "docu";

  const purge = useMutation({
    mutationFn: () => purgeTrashApi(item.deletedGroupId),
    onSuccess: () => {
      // 활성 목록에는 이미 없던 항목이라 휴지통만 갱신하면 됨
      queryClient.invalidateQueries({ queryKey: queryKeys.trash });
      onClose();
    },
  });

  return (
    <Modal onClose={onClose} disableClose={purge.isPending}>
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-50 text-red-500 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-800">영구 삭제</h2>
            <p className="mt-1 text-sm text-slate-600">
              {KIND_STYLE[item.kind].label} "
              <span className="font-medium">{item.title}</span>"
              {hasDescendants && "과(와) 하위 항목 전체"}이(가) 완전히 삭제돼요.
              되돌릴 수 없어요.
            </p>
          </div>
        </div>

        {hasDescendants && (
          <div className="px-3 py-2.5 bg-red-50/60 border border-red-100 rounded-lg text-xs text-red-700 space-y-1.5">
            <p>
              이 항목보다 먼저 따로 휴지통에 넣은 하위 항목도 함께 삭제돼요.
            </p>
            {childRoots.length > 0 && (
              <ul className="space-y-0.5 pl-1">
                {childRoots.map((child) => (
                  <li key={child.deletedGroupId} className="truncate">
                    · {KIND_STYLE[child.kind].label} "{child.title}"
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {purge.error && (
          <p className="text-xs text-red-500">{purge.error.message}</p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            disabled={purge.isPending}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            취소
          </button>
          <button
            onClick={() => purge.mutate()}
            disabled={purge.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-lg shadow-sm transition"
          >
            {purge.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>영구 삭제</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
