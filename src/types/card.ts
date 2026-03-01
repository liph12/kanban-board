import { Dayjs } from "dayjs";
import type { Project } from "./workspace";

export type Permission = "admin" | "read" | "write" | "owner";
export interface UserPermission {
  permission: Permission;
  description: string;
}

export type Status = "pending" | "progress" | "done" | "archived" | "delete";

export interface Contributor {
  id: number;
  name: string;
  email: string;
  full_name: string;
  avatar: string;
  permission: Permission;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  activity_id?: string;
  unread_count?: number;
  color?: string;
  status: Status;
  projectId: string;
  project?: Project;
  contributor: Contributor | null;
  startedAt: Dayjs | null;
  endedAt: Dayjs | null;
  updatedAt: string | null;
}
