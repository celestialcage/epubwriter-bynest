import { useState } from "react";
import type { TrashItem } from "../../types/types";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../services/queryKeys";
import { getTrashApi } from "../../services/trash";
import { Trash2 } from "lucide-react";
import { KIND_STYLE } from "../trash/trashUtils";
import TrashRow from "../trash/TrashRow";

type Filter = "all" | TrashItem["kind"];
const FILTERS: Filter[] = ["all", "series", "book", "chapter", "docu"];

export default function TrashPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const {
    data: items = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: queryKeys.trash,
    queryFn: getTrashApi,
  });

  const countOf = (f: Filter) =>
    f === "all" ? items.length : items.filter((t) => t.kind === f).length;
  const visible =
    filter === "all" ? items : items.filter((t) => t.kind === filter);

  return (
    <div className="h-full flex flex-col gap-6 py-2 select-none">
      {/* 헤더 */}
      <div className="pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-50 text-red-500">
            <Trash2 className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">휴지통</h1>
          {!isPending && (
            <span className="text-sm font-medium text-slate-400">
              {items.length}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          함께 삭제된 항목은 묶여 있어요. 복원과 영구 삭제도 묶음 단위로
          이뤄져요.
        </p>
      </div>

      {/* 종류 필터 */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                active
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f === "all" ? "전체" : KIND_STYLE[f].label}{" "}
              <span className={active ? "text-slate-300" : "text-slate-400"}>
                {countOf(f)}
              </span>
            </button>
          );
        })}
      </div>

      {/* 목록 */}
      {isPending ? (
        <p className="text-sm text-slate-400">불러오는 중...</p>
      ) : isError ? (
        <p className="text-sm text-red-500">휴지통을 불러오지 못했어요.</p>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
          <Trash2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">
            {items.length === 0
              ? "휴지통이 비어 있어요"
              : "이 종류의 항목이 없어요"}
          </p>
        </div>
      ) : (
        <ul className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
          {visible.map((item) => (
            <TrashRow key={item.deletedGroupId} item={item} allItems={items} />
          ))}
        </ul>
      )}
    </div>
  );
}
