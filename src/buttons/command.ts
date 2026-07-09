import path from "path";
import * as vscode from "vscode";

import { Button } from "@/buttons/button";
import { Configuration } from "@/helpers/configuration";
import { Utilities } from "@/helpers/utilities";
import type { CommandButton } from "@/types/command";
import type { StatusBarButton } from "@/types/statusBar";

export class Command {
  static createCommands(
    context: vscode.ExtensionContext,
    commands: CommandButton[],
    commandIds: Set<string>,
    disposables: vscode.Disposable[],
  ): void {
    Utilities.appendHyphenatedLine();

    if (!commands.length) {
      Utilities.appendLine(`[Command] No commands to create.`);
      return;
    }

    Utilities.appendLine(`[Command] Creating ${commands.length} commands...`);
    commands.forEach((command: CommandButton) => {
      const vsCommand =
        Configuration.extensionName + "." + command.id?.replace(" ", "");

      if (commandIds.has(vsCommand)) {
        Utilities.appendLine(
          `[Command] Duplicate id found: '${command.id}', skipping.`,
        );
        vscode.window.showErrorMessage(
          `The id '${command.id}' is used for multiple commands or dropdowns. Please remove duplicate id's.`,
        );
        return;
      }
      commandIds.add(vsCommand);
      Utilities.appendLine(`[Command] Registering command: '${vsCommand}'`);

      const disposable = vscode.commands.registerCommand(
        vsCommand,
        async () => {
          Utilities.appendLine(`[Command] Executing command: '${vsCommand}'`);
          const variables = Configuration.variables(command);

          if (!command) {
            Utilities.appendLine(
              `[Command] No command to execute for: '${vsCommand}'`,
            );
            vscode.window.showErrorMessage(
              "No command to execute for this action",
            );
            return;
          }

          if (command.saveAll) {
            Utilities.appendLine(`[Command] Saving all files...`);
            vscode.commands.executeCommand("workbench.action.files.saveAll");
          }

          if (command.useVsCodeApi) {
            Utilities.appendLine(
              `[Command] Executing VS Code API command: '${command.command}'`,
            );
            if (command.command) {
              vscode.commands.executeCommand(
                command.command,
                ...(command.args || []),
              );
            }
          } else {
            const terminalName =
              Utilities.interpolateString(command, command.terminal?.name) ||
              Utilities.interpolateString(command, command.label);
            const workspaceRoot =
              vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "";

            const cwd = variables.cwd
              ? path.isAbsolute(variables.cwd)
                ? variables.cwd
                : path.join(workspaceRoot ?? "", variables.cwd)
              : undefined;
            let associatedTerminal = command.terminal?.singleInstance
              ? vscode.window.terminals.find(
                  (terminal) =>
                    terminal.name === terminalName &&
                    terminal.shellIntegration?.cwd?.fsPath === cwd,
                )
              : undefined;
            let terminalAlreadyCleared = false;

            if (!associatedTerminal) {
              Utilities.appendLine(
                `[Command] Creating terminal: '${terminalName}'`,
              );

              Utilities.appendLine(
                `[Command] Terminal cwd: '${cwd ?? "default"}'`,
              );
              associatedTerminal = vscode.window.createTerminal({
                name: terminalName ?? undefined,
                cwd: cwd,
              });
              terminalAlreadyCleared = true;
              associatedTerminal.show(!command.terminal?.focus);
              await Utilities.sleep("1s");
            } else {
              Utilities.appendLine(
                `[Command] Reusing terminal: '${terminalName}'`,
              );
              associatedTerminal.show(!command.terminal?.focus);
            }

            if (command.terminal?.clear && !terminalAlreadyCleared) {
              Utilities.appendLine(
                `[Command] Clearing terminal: '${terminalName}'`,
              );
              associatedTerminal.sendText("clear");
              await Utilities.sleep(250);
            }

            if (command.command) {
              const interpolatedCommand =
                Utilities.interpolateString(command, command.command) ?? "";
              Utilities.appendLine(
                `[Command] Sending text to terminal: '${interpolatedCommand}'`,
              );
              associatedTerminal.sendText(interpolatedCommand);
            }
          }
        },
      );

      context.subscriptions.push(disposable);
      disposables.push(disposable);

      if (command.showButton) {
        Utilities.appendLine(
          `[Command] Creating status bar button for: '${vsCommand}'`,
        );
        const statusBarOptions: StatusBarButton = {
          alignment: command.alignment,
          color: command.color || Configuration.defaultColor(),
          command: vsCommand,
          label: command.label ?? null,
          tooltip: command.tooltip || vsCommand,
          priority: command.priority ?? 0,
        };

        Button.createStatusBarButton(statusBarOptions, disposables);
      }
    });

    Utilities.appendLine(`[Command] Finished creating commands.`);
  }
}
