import {
  WindowRounded,
  FolderOpenRounded,
  SettingsRounded,
  SubtitlesRounded,
  NotificationsRounded,
  AccountCircleRounded,
} from "@mui/icons-material";
import { Route } from "react-router-dom";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import type { SvgIconTypeMap } from "@mui/material";

export interface Route {
  title: string;
  path: string;
  expanded?: boolean;
  expandable?: boolean;
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  children: Route[];
}

export const DEFAULT_ROUTES: Route[] = [
  {
    title: "Main",
    path: "/",
    icon: WindowRounded,
    children: [],
  },
  {
    title: "Activity",
    path: "/activity",
    icon: NotificationsRounded,
    children: [],
  },
  {
    title: "Projects",
    path: "/projects",
    expanded: false,
    expandable: true,
    icon: FolderOpenRounded,
    children: [],
  },
  {
    title: "Settings",
    path: "/settings",
    expanded: false,
    expandable: true,
    icon: SettingsRounded,
    children: [
      {
        title: "Workspace",
        path: "/settings/workspace",
        icon: SubtitlesRounded,
        children: [],
      },
      {
        title: "Account",
        path: "/settings/account",
        icon: AccountCircleRounded,
        children: [],
      },
    ],
  },
];
