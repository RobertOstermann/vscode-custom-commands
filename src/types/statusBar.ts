import type { StatusBarAlignment } from "vscode";

export type StatusBarButton = {
  alignment: StatusBarAlignment | undefined;
  color: string | undefined;
  command: string;
  label: string | null | undefined;
  priority: number | undefined;
  tooltip: string | undefined;
};
