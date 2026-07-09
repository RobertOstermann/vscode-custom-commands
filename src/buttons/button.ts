import * as vscode from "vscode";

import { Utilities } from "@/helpers/utilities";
import type { StatusBarButton } from "@/types/statusBar";

export class Button {
  static createStatusBarButton(
    options: StatusBarButton,
    disposables: vscode.Disposable[],
  ): void {
    const statusBarItem = vscode.window.createStatusBarItem(
      options.alignment ?? vscode.StatusBarAlignment.Left,
      options.priority,
    );

    const updateLabel = () => {
      statusBarItem.text =
        Utilities.interpolateString(undefined, options.label) ?? "";
    };

    updateLabel();
    statusBarItem.color = options.color;
    statusBarItem.command = options.command;
    statusBarItem.tooltip = options.tooltip;
    statusBarItem.show();

    const listener = vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        updateLabel();
      }
    });

    disposables.push(statusBarItem, listener);

    Utilities.appendLine(
      `[Button] Status bar button created: '${options.command}'`,
    );
  }
}
