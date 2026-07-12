import { ms } from "convert";
import * as vscode from "vscode";

// eslint-disable-next-line import/no-cycle
import { Configuration } from "@/helpers/configuration";
import type { CommandButton } from "@/types/command";
import type { Variables } from "@/types/variables";

export class Utilities {
  static extensionName = "better-status-bar";
  static outputChannel = vscode.window.createOutputChannel("Better Status Bar");

  static appendHyphenatedLine(newLines = true) {
    if (newLines) {
      Utilities.outputChannel.appendLine(
        "\n------------------------------------------------------------\n",
      );
    } else {
      Utilities.outputChannel.appendLine(
        "------------------------------------------------------------",
      );
    }
  }

  static appendLine(value: string) {
    Utilities.outputChannel.appendLine(value);
  }

  static normalizePath(path: string, allowEscapes = false): string {
    if (path === undefined) {
      return path;
    }

    // Capitalize drive letter
    path = path.replace(/^[A-Za-z]:/, (match) => match.toUpperCase());

    if (allowEscapes) {
      return path.replace(/\\{2,}/g, "/");
    }

    return path.replace(/\\+/g, "/");
  }

  /**
   * A promise that resolves after the given number of milliseconds. Accepts a
   * number (ms) or a time string (e.g. "1s", "500ms").
   *
   * @example
   *   // resolves after 1 second
   *   await Utilities.sleep("1s");
   *
   * @example
   *   // resolves after 100 milliseconds
   *   await Utilities.sleep(500);
   */
  static async sleep(duration: number | string) {
    const delay = typeof duration === "string" ? ms(duration) : duration;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  static interpolateString(
    command: CommandButton | undefined,
    text: string | null | undefined,
  ): string | null {
    if (!text) {
      return text ?? null;
    }

    const variables = Configuration.variables(command);

    const regex = /\$\{([^\}]+)\}/g; // eslint-disable-line no-useless-escape

    const match = text.match(regex);
    while (match?.length) {
      const placeholder = match.pop();
      const path = placeholder?.replace("${", "").replace("}", "");
      if (path) {
        const variable = variables[path as keyof Variables];
        if (variable !== null && variable !== undefined && placeholder) {
          text = text.replace(placeholder, String(variable));
        }
      }
    }

    return text;
  }
}
