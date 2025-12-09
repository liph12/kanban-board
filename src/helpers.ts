import type { Status } from "./types/card";

export const getColorStatus = (status: Status) => {
  switch (status) {
    case "pending":
      return "#4a4a4a";
    case "progress":
      return "#1c3645";
    case "done":
      return "#162e1e";
    case "archived":
      return "#453e1c";
  }
};

export const getUserJson = () =>
  JSON.parse(localStorage.getItem("user") ?? "{}");
