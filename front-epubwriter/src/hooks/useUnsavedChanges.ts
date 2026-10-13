import { useLocation } from "react-router";
import { useUnsavedStore, type UnsavedScope } from "../stores/unsavedStore";
import { useSelectedBookId } from "./useSelectedBookId";
import { useEffect } from "react";

/** isDirty인 동안 저장소에 등록, 깨끗해지거나 언마운트되면 해제 */
export function useUnsavedChanges(
  key: string,
  isDirty: boolean,
  scope: UnsavedScope,
) {
  const { pathname } = useLocation();
  const bookId = useSelectedBookId();

  useEffect(() => {
    if (!isDirty) return;
    const { register, unregister } = useUnsavedStore.getState();
    register(key, { scope, pathname, bookId });
    return () => unregister(key);
  }, [key, isDirty, scope, pathname, bookId]);
}
