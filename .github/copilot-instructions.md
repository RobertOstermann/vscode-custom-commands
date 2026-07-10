---
applyTo: "**"
---

# Copilot Instructions

## General

- This is a VS Code extension called **Better Status Bar** (`betterStatusBar`).
- The extension adds customizable buttons to the status bar to execute terminal commands or VS Code API commands.
- Publisher: `RobertOstermann`, Engine: `^1.93.0`.

## Architecture

- `src/extension.ts` — entry point, registers the refresh command and calls `init`.
- `src/init.ts` — initializes commands, dropdowns, and the reload button.
- `src/buttons/command.ts` — registers VS Code commands and handles terminal execution.
- `src/buttons/button.ts` — creates status bar items.
- `src/buttons/dropdown.ts` — creates quick-pick dropdowns.
- `src/helpers/configuration.ts` — reads and merges all configuration sources.
- `src/helpers/utilities.ts` — string interpolation, logging, and sleep helpers.
- `src/types/` — TypeScript types for commands, dropdowns, variables, etc.
- `src/schema/statusBar.schema.json` — JSON schema for `statusBar.json` config files.

## Configuration Priority

All settings follow this priority order (highest to lowest):

1. Configuration file (`statusBar.json` / `statusBar.jsonc`)
2. Workspace folder settings (`workspaceFolderValue`)
3. Workspace settings (`workspaceValue`)
4. User/global settings (`globalValue`)

Always use `config.inspect()` instead of `config.get()` to access each scope independently.

## Configuration Files

- Users can set `betterStatusBar.configurationFile` to `find` or a direct path.
- `find` uses `glob.sync` with `dot: true` to search all workspace folders including hidden directories like `.vscode/`.
- Multiple configuration files are supported — `commands` and `dropdowns` arrays are merged.
- First file wins for duplicate `id`s.
- The code strips `betterStatusBar.` prefix from config file keys before parsing.

## String Interpolation

- Use `Utilities.interpolateString(command, text)` to resolve `${variable}` placeholders.
- Variables are resolved at **execution time**, not at registration time.
- Always call `interpolateString` inside the `registerCommand` callback, never outside.
- Supported variables match VS Code's built-in variables: `${fileBasename}`, `${fileDirname}`, `${workspaceFolder}`, etc.
- Empty string values should still be substituted (check `!== null && !== undefined`, not just truthiness).

## Terminal Handling

- Terminal `cwd` must be resolved via `interpolateString` before use.
- Relative `cwd` paths are resolved from the workspace root.
- `reuse` option controls terminal reuse: `"name"` | `"active"` | `"never"` | `"dispose"` | `"disposeOnSuccess"`.
  - `"name"` — find existing terminal by name and `shellIntegration.cwd.fsPath`.
  - `"active"` — use `vscode.window.activeTerminal`.
  - `"never"` — always create a new terminal.
  - `"dispose"` — create a new terminal and dispose it after the command runs.
  - `"disposeOnSuccess"` — create a new terminal and dispose it only if the command exits with code `0`. Requires `shellIntegration`. If unavailable, keeps the terminal open.
- Use `shellIntegration.executeCommand()` + `onDidEndTerminalShellExecution` to detect exit codes for `dispose` and `disposeOnSuccess`.
- `singleInstance` is deprecated in favor of `reuse`.
- `terminalAlreadyCleared` is set to `true` when a new terminal is created to skip the clear step.
- `terminal.clear` accepts `boolean | string` — a string value is used as the custom clear command.
- Default clear command: `cls` on Windows, `clear` on macOS/Linux.

## Status Bar Buttons

- Labels and tooltips must be updated dynamically via `onDidChangeActiveTextEditor`.
- Only show the button after the first successful label update to avoid flashing raw `${...}` placeholders.
- Static labels (no `${...}`) can be shown immediately.

## Duplicate Detection

- When checking for duplicate `id`s always compare `x.id === item.id` (not `x.id === x.id`).
- Log skipped duplicates with a message indicating which source wins.

## Logging

- Use `Utilities.appendLine(...)` for all log output.
- Prefix log messages with the source in brackets, e.g. `[Command]`, `[Configuration]`, `[Dropdown]`.
- Log counts when loading commands/dropdowns from each source.
- Call `Utilities.appendHyphenatedLine()` at the start of major sections.

## TypeScript Conventions

- Use explicit types — avoid `any` where possible.
- Use optional chaining (`?.`) and nullish coalescing (`??`) consistently.
- Use `path.join`, `path.isAbsolute`, `path.basename`, etc. from the `path` module for all path operations.
- Prefer `const` over `let` where the value is not reassigned.

## JSON / JSONC

- `package.json` is the source of truth for all configuration properties, enums, defaults, and descriptions.
- `src/schema/statusBar.schema.json` must stay in sync with `package.json` configuration properties.
- Always update both `package.json` and `src/schema/statusBar.schema.json` together when adding or changing configuration options.
- The schema uses `betterStatusBar.` prefixed property names.
- Use `markdownDescription` instead of `description` for all properties.
- Use `enumDescriptions` or `markdownEnumDescriptions` alongside `enum` values.
- Use `"type": ["string", "null"]` for nullable string properties.
- Do not use `"required": false` — omit `required` or use it as an array of required property names.
- Register the schema in `package.json` under `contributes.jsonValidation` with `"url": "./src/schema/statusBar.schema.json"` (source path, not `out/`).
- `fileMatch` should cover all casing variants: `statusBar.json`, `statusbar.jsonc`, `betterStatusBar.json`, etc.
- Use `examples` instead of `enum` when a field accepts free-form input but has common values (e.g. `configurationFile`).

## Markdown

- `CHANGELOG.md` should be updated for every user-facing change.
- Only use `### Added`, `### Changed`, `### Fixed` sections for major releases. For minor/patch releases, use a flat bullet list.
- Keep descriptions concise and user-focused — avoid internal implementation details.
- `README.md` should reflect all current configuration options and their defaults.
