type Severity = "success" | "error" | "warning" | "info";

export interface Notification {
  type: Severity;
  message: string;
  open: boolean;
}
