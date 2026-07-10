import type { StatusBarAlignment } from "vscode";

export type TerminalOptions = {
  name?: string;
  clear?: string | boolean;
  cwd?: string;
  focus?: boolean;
  singleInstance?: boolean;
  reuse?: "name" | "active" | "never" | "dispose" | "disposeOnSuccess";
};

export type CommandButton = {
  id?: string;
  label?: string;
  command?: string;
  alignment?: StatusBarAlignment;
  color?: string;
  priority?: number;
  saveAll?: boolean;
  showButton?: boolean;
  tooltip?: string;
  terminal?: TerminalOptions;
  useVsCodeApi?: boolean;
  args?: string[];
};
