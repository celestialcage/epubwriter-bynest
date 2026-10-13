import type { TrashItem } from "../types/types";
import { api } from "./client";

export const getTrashApi = () => api<TrashItem[]>("/trash");

export const restoreTrashApi = (groupId: string) =>
  api<void>(`/trash/${groupId}/restore`, { method: "POST" });

export const purgeTrashApi = (groupId: string) =>
  api<void>(`/trash/${groupId}`, { method: "DELETE" });
