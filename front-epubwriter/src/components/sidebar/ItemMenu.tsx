import { MoreVertical, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface MenuAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  danger?: boolean;
}

export default function ItemMenu({ actions }: { actions: MenuAction[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return; // 열렸을 때만 리스너 등록
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    // 메뉴 안의 클릭이 행 클릭(책 선택, 아코디언 토글)으로 번지지 않게
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-300/50 rounded transition-opacity ${
          open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        title="더보기"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 font-normal animate-in fade-in zoom-in-95 duration-100">
          {actions.map(({ label, icon: Icon, onClick, danger }) => (
            <button
              key={label}
              onClick={() => {
                setOpen(false);
                onClick();
              }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition ${
                danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${danger ? "text-red-500" : "text-slate-500"}`}
              />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
