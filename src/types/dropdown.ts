import type { StatusBarAlignment } from "vscode";

type DropdownOptions = {
  /** Determines if the dropdown should stay open even when losing dropdown focus. */
  ignoreFocusOut?: boolean;
  /** Optional placeholder in the filter text. */
  placeholder?: string;
  /** An optional title. */
  title?: string;
};

export type DropdownButton = {
  /** The unique ID of the quick-select button. The ID is prepended with `betterStatusBar.` and can be used to create keyboard shortcuts. */
  id?: string;
  /** The label of the quick-select button. Supports variable interpolation. */
  label?: string;
  /** A list of command `id`s or labels to display in the dropdown. */
  commands?: string[];
  /** The alignment of the status bar button. `1` = left, `2` = right. */
  alignment?: StatusBarAlignment;
  /** The color of the status bar button text. */
  color?: string;
  /** @deprecated Use `options.ignoreFocusOut` instead. */
  ignoreFocusOut?: boolean;
  /** The priority of the button. A higher value means the button is shown more to the left. */
  priority?: number;
  /** Determines if the status bar button is shown on the status bar. */
  showButton?: boolean;
  /** Tooltip text to display when hovering over the button. Supports variable interpolation. */
  tooltip?: string;
  /** The quick-select options. */
  options?: DropdownOptions;
};
