import type { Status } from "./types/card";
import type { Permission } from "./types/card";

export const getColorStatus = (status: Status | string) => {
  switch (status) {
    case "pending":
      return "inherit";
    case "progress":
      return "info";
    case "done":
      return "success";
    case "archived":
      return "warning";
    case "delete":
      return "error";
  }
};

export const getUserJson = () =>
  JSON.parse(localStorage.getItem("auth_user") ?? "{}");

export const shortenText = (text: string, len: number) =>
  text.length > len ? `${text.slice(0, len)}...` : text;

export const getPermissionColor = (perm: Permission) => {
  switch (perm) {
    case "admin":
      return "primary";
    case "write":
      return "info";
    case "read":
      return "default";
    case "owner":
      return "success";
  }
};

export const getStatusActivityValue = (status: Status | string) => {
  switch (status) {
    case "pending":
      return "Not started";
    case "progress":
      return "In progress";
    case "done":
      return "Done";
    case "archived":
      return "Archived";
    case "delete":
      return "Deleted";
  }
};
