import * as vscode from "vscode";

import { Configuration } from "@/helpers/configuration";
import { Utilities } from "@/helpers/utilities";
import { init } from "@/init";

let disposables: vscode.Disposable[] = [];

const initialize = async (context: vscode.ExtensionContext): Promise<void> => {
  Utilities.appendLine(`[Extension] Initializing...`);
  Utilities.appendHyphenatedLine();

  // Clean up the previous status bar buttons.
  Utilities.appendLine(
    `[Extension] Disposing ${disposables.length} previous disposables...`,
  );
  disposables.forEach((disposable: vscode.Disposable) => disposable.dispose());
  disposables.splice(0, disposables.length);

  // Add the new status bar buttons to the list of disposables.
  disposables = Configuration.initialize(context);
  disposables = await init(context, disposables);

  Utilities.appendLine(`[Extension] Initialization complete.`);
  Utilities.appendHyphenatedLine();
};

export function activate(context: vscode.ExtensionContext) {
  Utilities.appendLine(`[Extension] Activating Better Status Bar...`);
  initialize(context);

  const disposable = vscode.commands.registerCommand(
    `${Configuration.extensionName}.refreshButtons`,
    () => {
      Utilities.appendLine(`[Extension] Refreshing buttons...`);
      initialize(context);
    },
  );

  context.subscriptions.push(disposable);
  Utilities.appendLine(`[Extension] Activated.`);
}

// This method is called when the extension is deactivated
export function deactivate() {
  Utilities.appendLine(`[Extension] Deactivated.`);
  return;
}
