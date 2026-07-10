import type { StatusBarAlignment } from "vscode";

export type TerminalOptions = {
  /** The name of the terminal. If a terminal with this name is already open it will be reused based on the `reuse` option. */
  name?: string;
  /** Determines if the terminal is cleared before the command runs. Set to `true` for the default clear command, `false` to disable, or a custom string to use as the clear command. */
  clear?: string | boolean;
  /** The working directory for the terminal command. Absolute paths are used as-is. Relative paths are resolved from the workspace root. */
  cwd?: string;
  /** Focus the terminal after executing the command. */
  focus?: boolean;
  /**
   * @deprecated Use `reuse` instead.
   */
  singleInstance?: boolean;
  /**
   * Determines how the terminal is reused when the command is run.
   * - `"name"` — reuse a terminal matching the name and cwd.
   * - `"active"` — reuse the currently active terminal.
   * - `"never"` — always create a new terminal.
   * - `"dispose"` — reuse a terminal matching the name and cwd, then dispose it after the command runs.
   * - `"disposeOnSuccess"` — reuse a terminal matching the name and cwd, then dispose it only if the command succeeds.
   */
  reuse?: "name" | "active" | "never" | "dispose" | "disposeOnSuccess";
};

export type CommandButton = {
  /** The unique ID of the status bar button. Prepended with `betterStatusBar.` to form the VS Code command id. */
  id?: string;
  /** The label displayed on the status bar button. Supports variable interpolation. */
  label?: string;
  /** The command to execute. Runs in the terminal unless `useVsCodeApi` is `true`. */
  command?: string;
  /** The alignment of the status bar button. `1` = left, `2` = right. */
  alignment?: StatusBarAlignment;
  /** The color of the status bar button text. */
  color?: string;
  /** The priority of the button. A higher value means the button is shown more to the left. */
  priority?: number;
  /** Save all open files before executing the command. */
  saveAll?: boolean;
  /** Determines if the status bar button is shown on the status bar. */
  showButton?: boolean;
  /** Tooltip text to display when hovering over the button. Supports variable interpolation. */
  tooltip?: string;
  /** Terminal settings for this command. Only valid when `useVsCodeApi` is `false`. */
  terminal?: TerminalOptions;
  /** Specifies whether to execute a VS Code command or a terminal command. */
  useVsCodeApi?: boolean;
  /** A list of arguments passed to the VS Code command. Only valid when `useVsCodeApi` is `true`. */
  args?: string[];
};
