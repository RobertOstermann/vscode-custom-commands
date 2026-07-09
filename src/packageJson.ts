import { StatusBarAlignment, workspace } from "vscode";

import { Utilities } from "@/helpers/utilities";

import type { CommandButton, TerminalOptions } from "./types/command";

export const getPackageJson = async (): Promise<undefined | any> =>
  new Promise((resolve) => {
    const cwd = workspace.workspaceFolders?.[0].uri.fsPath;
    if (!cwd) {
      Utilities.appendLine(`[PackageJson] No workspace folder found.`);
      resolve(undefined);
    }

    try {
      Utilities.appendLine(`[PackageJson] Reading package.json from: ${cwd}`);
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const packageJson = require(`${cwd}/package.json`);
      Utilities.appendLine(`[PackageJson] Successfully read package.json.`);

      resolve(packageJson);
    } catch (error) {
      Utilities.appendLine(
        `[PackageJson] Error reading package.json: ${error}`,
      );
      resolve(undefined);
    }
  });

export const buildConfigFromPackageJson = async (defaultColor: string) => {
  Utilities.appendLine(`[PackageJson] Building config from package.json...`);
  const pkg = await getPackageJson();
  if (!pkg) {
    Utilities.appendLine(`[PackageJson] No package.json found, skipping.`);
    return [];
  }

  const { scripts } = pkg;
  Utilities.appendLine(
    `[PackageJson] Found ${Object.keys(scripts).length} scripts.`,
  );

  const terminalOptions: TerminalOptions = {
    cwd: workspace.workspaceFolders?.[0].uri.fsPath,
    focus: true,
    singleInstance: true,
  };

  const commands = Object.keys(scripts).map((key) => ({
    id: key,
    label: key,
    command: `npm run ${key}`,
    alignment: StatusBarAlignment.Left,
    color: defaultColor,
    priority: 0,
    createButton: true,
    saveAll: false,
    showButton: true,
    tooltip: undefined,
    terminal: terminalOptions,
    useVsCodeApi: false,
    args: [],
  })) satisfies CommandButton[];

  Utilities.appendLine(
    `[PackageJson] Built ${commands.length} commands from package.json.`,
  );
  return commands;
};
