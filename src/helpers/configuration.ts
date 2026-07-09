import * as fs from "fs";
import * as glob from "glob";
import { homedir } from "os";
import * as path from "path";
import * as vscode from "vscode";

import { Utilities } from "@/helpers/utilities";
import type { CommandButton } from "@/types/command";
import type { DropdownButton } from "@/types/dropdown";
import type { Variables } from "@/types/variables";

export class Configuration {
  static extensionName = "betterStatusBar";

  /**
   * Initialize the configuration options that require a reload upon change.
   */
  static initialize(context: vscode.ExtensionContext): vscode.Disposable[] {
    const disposables: vscode.Disposable[] = [];
    if (Configuration.showReloadButton()) return disposables;

    const configurationChange = vscode.workspace.onDidChangeConfiguration(
      (event) => {
        if (event.affectsConfiguration(Configuration.extensionName)) {
          vscode.commands.executeCommand(
            `${Configuration.extensionName}.refreshButtons`,
          );
        }
      },
    );

    if (Configuration.configurationFilePaths() !== null) {
      const configurationFileChange = vscode.workspace.onDidSaveTextDocument(
        (event) => {
          const savedPath = event.uri.fsPath.replace(/\\/g, "/").toLowerCase();
          const isConfigFile = Configuration.configurationFilePaths().some(
            (filePath) => filePath.toLowerCase() === savedPath,
          );
          if (isConfigFile) {
            Utilities.appendLine(
              `[Configuration] Configuration file saved: '${savedPath}', refreshing buttons...`,
            );
            vscode.commands.executeCommand(
              `${Configuration.extensionName}.refreshButtons`,
            );
          }
        },
      );

      context.subscriptions.push(configurationFileChange);
      disposables.push(configurationFileChange);
    }

    context.subscriptions.push(configurationChange);
    disposables.push(configurationChange);

    return disposables;
  }

  /**
   * Initialize the configuration options that require a reload upon change.
   */
  static extensionPath(context: vscode.ExtensionContext): string {
    const extensionPath = context.extensionPath.replace(/\\/g, "/");

    return extensionPath;
  }

  /**
   * @returns Determines whether or not to use the configuration file.
   */
  static applyConfigurationFile(): boolean {
    const configurationFile = Configuration.configurationFile() || "";

    return configurationFile === "" ? false : true;
  }

  /**
   * @returns Determines whether or not to use the configuration file.
   */
  static configurationFile(): string | undefined {
    return vscode.workspace
      .getConfiguration(Configuration.extensionName)
      .get("configurationFile");
  }

  /**
   * @returns The path to the configuration files.
   */
  static configurationFilePaths(): string[] {
    const configurationFile = Configuration.configurationFile() || "";

    if (configurationFile.toLowerCase() === "find") {
      Utilities.appendLine(
        `[Configuration] Searching for configuration files...`,
      );
      const pattern =
        "**/{statusbar,statusBar,StatusBar,betterstatusbar,betterStatusBar,BetterStatusBar}.{json,jsonc}";
      const paths: string[] = [];

      vscode.workspace.workspaceFolders?.forEach((workspaceFolder) => {
        const folder = workspaceFolder.uri.fsPath.replace(/\\/g, "/");
        Utilities.appendLine(`[Configuration] Searching in: '${folder}'`);
        const files = glob.sync(pattern, { cwd: folder, dot: true });
        files.forEach((file) => {
          const filePath = folder + "/" + file;
          Utilities.appendLine(
            `[Configuration] Found configuration file: '${filePath}'`,
          );
          paths.push(filePath);
        });
      });

      if (!paths.length) {
        Utilities.appendLine(`[Configuration] No configuration files found.`);
      }
      return paths;
    }

    if (configurationFile) {
      Utilities.appendLine(
        `[Configuration] Using configuration file: '${configurationFile}'`,
      );
      return [configurationFile];
    }

    return [];
  }

  /**
   * @returns The merged JSON object for all configuration files.
   */
  static configurationFileJSON(): any {
    const paths = Configuration.configurationFilePaths();
    if (!Configuration.applyConfigurationFile() || !paths.length) return null;

    const merged: any = { commands: [], dropdowns: [] };

    for (const filePath of paths) {
      if (!fs.existsSync(filePath)) {
        Utilities.appendLine(
          `[Configuration] Configuration file not found: ${filePath}`,
        );
        continue;
      }

      Utilities.appendLine(
        `[Configuration] Reading configuration file: ${filePath}`,
      );
      let fileData = fs.readFileSync(filePath).toString();
      fileData = fileData.replace(
        /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
        (m, g) => (g ? "" : m),
      );
      fileData = fileData.replace(/,(\s*[}\]])/g, "$1");
      fileData = fileData.replace(/betterStatusBar\./g, "");

      try {
        const json = JSON.parse(fileData);
        Utilities.appendLine(
          `[Configuration] Successfully parsed: '${filePath}'`,
        );

        if (json.commands) {
          json.commands.forEach((command: CommandButton) => {
            const isDuplicate = merged.commands.some(
              (c: CommandButton) => c.id && c.id === command.id,
            );
            if (isDuplicate) {
              Utilities.appendLine(
                `[Configuration] Skipping duplicate command id: '${command.id}' (first file wins)`,
              );
            } else {
              merged.commands.push(command);
            }
          });
        }

        if (json.dropdowns) {
          json.dropdowns.forEach((dropdown: DropdownButton) => {
            const isDuplicate = merged.dropdowns.some(
              (d: DropdownButton) => d.id && d.id === dropdown.id,
            );
            if (isDuplicate) {
              Utilities.appendLine(
                `[Configuration] Skipping duplicate dropdown id: '${dropdown.id}' (first file wins)`,
              );
            } else {
              merged.dropdowns.push(dropdown);
            }
          });
        }

        // Merge top-level scalar values (first file wins)
        Object.keys(json).forEach((key) => {
          if (
            key !== "commands" &&
            key !== "dropdowns" &&
            merged[key] === undefined
          ) {
            merged[key] = json[key];
          }
        });
      } catch (error) {
        Utilities.appendLine(
          `[Configuration] Error parsing configuration file '${filePath}': ${error}`,
        );
      }
    }

    return merged;
  }

  /**
   * @returns The color to use for status bar button text. The default is the theme color.
   */
  static defaultColor(): string {
    if (Configuration.applyConfigurationFile()) {
      const configuration = Configuration.configurationFileJSON();
      const defaultColor = configuration?.defaultColor;
      if (defaultColor !== undefined) {
        return defaultColor;
      }
    }

    return vscode.workspace
      .getConfiguration(Configuration.extensionName)
      .get<string>("defaultColor", "statusBar.foreground");
  }

  /**
   * @returns Automatically generate buttons from npm commands listed in `package.json`.
   */
  static loadNpmCommands(): boolean {
    if (Configuration.applyConfigurationFile()) {
      const configuration = Configuration.configurationFileJSON();
      const loadNpmCommands = configuration?.loadNpmCommands;
      if (loadNpmCommands !== undefined) return loadNpmCommands;
    }

    return vscode.workspace
      .getConfiguration(Configuration.extensionName)
      .get<boolean>("loadNpmCommands", false);
  }

  /**
   * @returns The text for the reload button. The default is to reload on configuration change and not show a reload button.
   */
  static reloadButton(): string | null {
    if (Configuration.applyConfigurationFile()) {
      const configuration = Configuration.configurationFileJSON();
      const reloadButton = configuration?.reloadButton;
      if (reloadButton !== undefined) return reloadButton;
    }

    return vscode.workspace
      .getConfiguration(Configuration.extensionName)
      .get<string | null>("reloadButton", null);
  }

  /**
   * @returns The text for the reload button. The default is to reload on configuration change and not show a reload button.
   */
  static showReloadButton(): boolean {
    return Configuration.reloadButton() !== null;
  }

  /**
   * @returns A list of status bar buttons for specified commands.
   */
  static commands(): Array<CommandButton> {
    Utilities.appendLine(`[Configuration] Loading commands...`);
    let commands: CommandButton[] = [];

    if (Configuration.applyConfigurationFile()) {
      const configuration = Configuration.configurationFileJSON();
      commands = configuration?.commands ? configuration.commands : [];
      Utilities.appendLine(
        `[Configuration] Loaded ${commands.length} commands from configuration file.`,
      );
    }

    const userCommands = vscode.workspace
      .getConfiguration(Configuration.extensionName)
      .get<CommandButton[]>("commands", []);
    Utilities.appendLine(
      `[Configuration] Loaded ${userCommands.length} commands from VS Code settings.`,
    );

    const config = vscode.workspace.getConfiguration(
      Configuration.extensionName,
    );
    const inspect = config.inspect<CommandButton[]>("commands");

    const globalCommands = inspect?.globalValue ?? [];
    const workspaceCommands = inspect?.workspaceValue ?? [];
    const workspaceFolderCommands = inspect?.workspaceFolderValue ?? [];

    Utilities.appendLine(
      `[Configuration] Loaded ${globalCommands.length} commands from user settings.`,
    );
    Utilities.appendLine(
      `[Configuration] Loaded ${workspaceCommands.length} commands from workspace settings.`,
    );
    Utilities.appendLine(
      `[Configuration] Loaded ${workspaceFolderCommands.length} commands from workspace folder settings.`,
    );

    [
      ...workspaceFolderCommands,
      ...workspaceCommands,
      ...globalCommands,
    ].forEach((command) => {
      const isDuplicate = commands.some((x) => x.id && x.id === command.id);
      if (isDuplicate) {
        Utilities.appendLine(
          `[Configuration] Skipping duplicate command id: '${command.id}'`,
        );
      } else {
        commands.push(command);
      }
    });

    commands.forEach((command) => Configuration.applyCommandDefaults(command));
    Utilities.appendLine(`[Configuration] Total commands: ${commands.length}`);
    return commands;
  }

  /**
   * @returns A status bar button that opens a quick-select of specified commands.
   */
  static dropdowns(): Array<DropdownButton> {
    Utilities.appendLine(`[Configuration] Loading dropdowns...`);
    let dropdowns: DropdownButton[] = [];

    if (Configuration.applyConfigurationFile()) {
      const configuration = Configuration.configurationFileJSON();
      dropdowns = configuration?.dropdowns ? configuration.dropdowns : [];
      Utilities.appendLine(
        `[Configuration] Loaded ${dropdowns.length} dropdowns from configuration file.`,
      );
    }

    const config = vscode.workspace.getConfiguration(
      Configuration.extensionName,
    );
    const inspect = config.inspect<CommandButton[]>("dropdowns");

    const globalDropdowns = inspect?.globalValue ?? [];
    const workspaceDropdowns = inspect?.workspaceValue ?? [];
    const workspaceFolderDropdowns = inspect?.workspaceFolderValue ?? [];

    Utilities.appendLine(
      `[Configuration] Loaded ${globalDropdowns.length} dropdowns from user settings.`,
    );
    Utilities.appendLine(
      `[Configuration] Loaded ${workspaceDropdowns.length} dropdowns from workspace settings.`,
    );
    Utilities.appendLine(
      `[Configuration] Loaded ${workspaceFolderDropdowns.length} dropdowns from workspace folder settings.`,
    );

    [
      ...workspaceFolderDropdowns,
      ...workspaceDropdowns,
      ...globalDropdowns,
    ].forEach((dropdown) => {
      const isDuplicate = dropdowns.some((x) => x.id && x.id === dropdown.id);
      if (isDuplicate) {
        Utilities.appendLine(
          `[Configuration] Skipping duplicate command id: '${dropdown.id}'`,
        );
      } else {
        dropdowns.push(dropdown);
      }
    });

    dropdowns.forEach((dropdown) =>
      Configuration.applyDropdownDefaults(dropdown),
    );
    Utilities.appendLine(
      `[Configuration] Total dropdowns: ${dropdowns.length}`,
    );
    return dropdowns;
  }

  /**
   * @returns The variables for a terminal
   */
  static variables(command: CommandButton | undefined): Variables {
    const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? null;

    const vars: Variables = {
      // - the path of the folder opened in VS Code
      workspaceFolder: rootPath,

      // - the name of the folder opened in VS Code without any slashes (/)
      workspaceFolderBasename: rootPath ? path.basename(rootPath) : null,

      // - the current opened file
      file: vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.document.fileName
        : null,

      // - the current opened file relative to workspaceFolder
      relativeFile:
        vscode.window.activeTextEditor && rootPath
          ? path.relative(
              rootPath,
              vscode.window.activeTextEditor.document.fileName,
            )
          : null,

      // - the current opened file's basename
      fileBasename: vscode.window.activeTextEditor
        ? path.basename(vscode.window.activeTextEditor.document.fileName)
        : null,

      // - the current opened file's basename with no file extension
      fileBasenameNoExtension: vscode.window.activeTextEditor
        ? path.parse(
            path.basename(vscode.window.activeTextEditor.document.fileName),
          ).name
        : null,

      // - the current opened file's dirname
      fileDirname: vscode.window.activeTextEditor
        ? path.dirname(vscode.window.activeTextEditor.document.fileName)
        : null,

      // - the current opened file's extension
      fileExtname: vscode.window.activeTextEditor
        ? path.parse(
            path.basename(vscode.window.activeTextEditor.document.fileName),
          ).ext
        : null,

      // - the task runner's current working directory on startup
      cwd: command?.terminal?.cwd || rootPath || homedir(),

      // - the current selected line number in the active file
      lineNumber: vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.selection.active.line + 1
        : null,

      // - the current selected text in the active file
      selectedText: vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.document.getText(
            vscode.window.activeTextEditor.selection,
          )
        : null,

      // - the path to the running VS Code executable
      execPath: process.execPath,
    };

    return vars;
  }

  /**
   * Sets default values for undefined properties on a command.
   */
  private static applyCommandDefaults(command: CommandButton): void {
    if (command.alignment === undefined)
      command.alignment = vscode.StatusBarAlignment.Left;
    if (command.color === undefined)
      command.color = Configuration.defaultColor();
    if (command.priority === undefined) command.priority = 0;
    if (command.saveAll === undefined) command.saveAll = false;
    if (command.showButton === undefined) command.showButton = true;
    if (command.terminal === undefined)
      command.terminal = {
        name: undefined,
        clear: true,
        cwd: undefined,
        focus: false,
        singleInstance: true,
      };
    if (command.terminal?.name === undefined) command.terminal.name = undefined;
    if (command.terminal?.clear === undefined) command.terminal.clear = true;
    if (command.terminal?.cwd === undefined) command.terminal.cwd = undefined;
    if (command.terminal?.focus === undefined) command.terminal.focus = false;
    if (command.terminal?.singleInstance === undefined)
      command.terminal.singleInstance = true;
    if (command.tooltip === undefined) command.tooltip = undefined;
    if (command.useVsCodeApi === undefined) command.useVsCodeApi = false;
    if (command.args === undefined) command.args = [];
  }

  /**
   * Sets default values for undefined properties on a dropdown.
   */
  private static applyDropdownDefaults(dropdown: DropdownButton): void {
    if (dropdown.alignment === undefined)
      dropdown.alignment = vscode.StatusBarAlignment.Left;
    if (dropdown.color === undefined)
      dropdown.color = Configuration.defaultColor();
    if (dropdown.priority === undefined) dropdown.priority = 0;
    if (dropdown.tooltip === undefined) dropdown.tooltip = undefined;
    if (dropdown.options === undefined)
      dropdown.options = {
        ignoreFocusOut: false,
        placeholder: undefined,
        title: undefined,
      };
    if (dropdown.options?.ignoreFocusOut === undefined)
      dropdown.options.ignoreFocusOut = false;
    if (dropdown.options?.placeholder === undefined)
      dropdown.options.placeholder = undefined;
    if (dropdown.showButton === undefined) dropdown.showButton = true;
    if (dropdown.options?.title === undefined)
      dropdown.options.title = undefined;
  }
}
