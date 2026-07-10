import type { StatusBarAlignment } from "vscode";

export type StatusBarButton = {
  /** The alignment of the status bar button. `1` = left, `2` = right. */
  alignment: StatusBarAlignment | undefined;
  /** The color of the status bar button text. */
  color: string | undefined;
  /** The VS Code command id to execute when the button is clicked. */
  command: string;
  /** The label displayed on the status bar button. Supports variable interpolation. */
  label: string | null | undefined;
  /** The priority of the button. A higher value means the button is shown more to the left. */
  priority: number | undefined;
  /** The tooltip text displayed when hovering over the button. Supports variable interpolation. */
  tooltip: string | undefined;
};
