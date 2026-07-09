import * as vscode from "vscode";

import { Button } from "@/buttons/button";
import { Configuration } from "@/helpers/configuration";
import { Utilities } from "@/helpers/utilities";
import type { CommandButton } from "@/types/command";
import type { DropdownButton } from "@/types/dropdown";
import type { StatusBarButton } from "@/types/statusBar";

export class Dropdown {
  static createDropdowns(
    context: vscode.ExtensionContext,
    commands: CommandButton[],
    commandIds: Set<string>,
    disposables: vscode.Disposable[],
  ): void {
    Utilities.appendHyphenatedLine();

    const dropdowns = Configuration.dropdowns();

    if (!commands.length || !dropdowns.length) {
      Utilities.appendLine(`[Dropdown] No dropdowns to create.`);
      return;
    }

    Utilities.appendLine(
      `[Dropdown] Creating ${dropdowns.length} dropdowns...`,
    );
    dropdowns.forEach((dropdown: DropdownButton) => {
      const vsCommand =
        Configuration.extensionName + "." + dropdown.id?.replace(" ", "");

      if (commandIds.has(vsCommand)) {
        Utilities.appendLine(
          `[Dropdown] Duplicate id found: '${dropdown.id}', skipping.`,
        );
        vscode.window.showErrorMessage(
          `The id '${dropdown.id}' is used for multiple commands or dropdowns. Please remove duplicate id's.`,
        );
        return;
      }
      commandIds.add(vsCommand);
      Utilities.appendLine(`[Dropdown] Registering dropdown: '${vsCommand}'`);

      const dropdownCommands = commands.filter(
        (command: CommandButton) =>
          (command.id && dropdown.commands?.includes(command.id)) ||
          (command.label && dropdown.commands?.includes(command.label)),
      );
      Utilities.appendLine(
        `[Dropdown] Found ${dropdownCommands.length} commands for dropdown: '${vsCommand}'`,
      );

      const disposable = vscode.commands.registerCommand(
        vsCommand,
        async () => {
          Utilities.appendLine(`[Dropdown] Opening dropdown: '${vsCommand}'`);

          const quickPickItems: vscode.QuickPickItem[] = dropdownCommands.map(
            (command: CommandButton) => ({
              label: Utilities.interpolateString(command, command.label) ?? "",
              description:
                Configuration.extensionName +
                "." +
                command.id?.replace(" ", ""),
            }),
          );

          const quickPick = vscode.window.createQuickPick();
          quickPick.title = dropdown.options?.title;
          quickPick.items = quickPickItems;
          quickPick.ignoreFocusOut = dropdown.ignoreFocusOut || false;
          quickPick.placeholder = dropdown.options?.placeholder;
          quickPick.onDidChangeSelection((selection) => {
            if (selection[0]) {
              quickPick.hide();
              const quickPickCommand = selection[0].description;
              Utilities.appendLine(
                `[Dropdown] Selected command: '${quickPickCommand}'`,
              );
              if (quickPickCommand) {
                vscode.commands.executeCommand(quickPickCommand);
              }
            }
          });
          quickPick.onDidHide(() => quickPick.dispose());
          quickPick.show();
        },
      );

      context.subscriptions.push(disposable);
      disposables.push(disposable);

      if (dropdown.showButton) {
        Utilities.appendLine(
          `[Dropdown] Creating status bar button for: '${vsCommand}'`,
        );
        const statusBarOptions: StatusBarButton = {
          alignment: dropdown.alignment,
          color: dropdown.color,
          command: vsCommand,
          label: dropdown.label,
          tooltip: dropdown.tooltip,
          priority: dropdown.priority,
        };

        Button.createStatusBarButton(statusBarOptions, disposables);
      }
    });

    Utilities.appendLine(`[Dropdown] Finished creating dropdowns.`);
  }
}
