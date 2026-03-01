import type { Item } from "./card";
import type { Contributor } from "./card";

export interface Project {
  id: string;
  title: string;
  description: string;
  workspace_title: string;
  workspace_id: string;
  items: Item[];
}

export interface Workspace {
  id: string;
  title: string;
  description: string;
  contributors: Contributor[];
  owner: Contributor;
  projects: Project[];
}

export interface AutocompleteValue {
  id: number | string;
  label: string;
}
