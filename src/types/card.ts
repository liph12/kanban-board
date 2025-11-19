import { Dayjs } from "dayjs";

export type Status = "pending" | "progress" | "done" | "archived" | "delete";

export interface Item {
  id: number;
  title: string;
  description: string;
  color?: string;
  status: Status;
  startedAt: Dayjs | null;
  endedAt: Dayjs | null;
}
