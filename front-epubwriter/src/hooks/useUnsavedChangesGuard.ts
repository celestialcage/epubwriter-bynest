import { matchPath, useBlocker } from "react-router";
import type { Id } from "../types/types";
import { useUnsavedStore, type UnsavedEntry } from "../stores/unsavedStore";
import { useEffect } from "react";

/** 저장 확인을 이미 거친 이동에 붙이는 state */
export const SKIP_UNSAVED_GUARD = { skipUnsavedGuard: true } as const;

function bookIdOf(pathname: string): Id | null {
  const match = matchPath("/docu/books/:bookId/*", pathname);
  return match?.params.bookId ? Number(match.params.bookId) : null;
}

function isLostOn(entry: UnsavedEntry, nextPathname: string): boolean {
  return entry.scope === "book"
    ? bookIdOf(nextPathname) !== entry.bookId
    : nextPathname !== entry.pathname;
}

/** AppLayout에서 한 번만 호출 (라우터는 blocker를 하나만 지원) */
export function useUnsavedChangesGuard() {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    const state = nextLocation.state as { skipUnsavedGuard?: boolean } | null;
    if (state?.skipUnsavedGuard) return false;
    if (currentLocation.pathname === nextLocation.pathname) return false;

    // 렌더링 시점 값이 아니라 지금 이 순간의 저장소 값을 읽음
    const entries = Object.values(useUnsavedStore.getState().entries);
    return entries.some((entry) => isLostOn(entry, nextLocation.pathname));
  });

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (
      confirm("저장하지 않은 변경사항이 있어요. 이동하면 사라져요. 이동할까요?")
    )
      blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  // 새로고침, 탭 닫기는 라우터 밖의 일이라 브라우저 이벤트로 따로 처리
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(useUnsavedStore.getState().entries).length > 0)
        e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
}
