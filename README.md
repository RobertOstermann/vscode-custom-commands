# Better Status Bar

Add customizable buttons to the status bar to execute actions or tasks in VS Code.

## Features

- Execute command in terminal
- Execute VS Code command
  - Any command that can be activated via a keyboard shortcut can be activated via a button
- Ability to customize text color for each button
- Add icons to buttons
  - Icons can be added to buttons by using the Markdown icons-in-labels syntax. For example, to add an alert icon you include `$(alert) in the button name. See https://code.visualstudio.com/api/references/icons-in-labels for more info

### Example

![](action.gif)

## Installation and setup

- [x] Install the `Better Status Bar` extension in your VS Code instance.
- [x] After installing, open your VS Code settings.json file.
- [x] Define the status bar buttons you want. Below is a sample configuration for reference.
- [x] Reload the VS Code window to see the new buttons. Alternatively, you can run the `Refresh Status Bar Buttons` command to refresh without reloading the window.

```json
{
  // Better Status Bar
  "betterStatusBar.defaultColor": "statusBar.foreground",
  "betterStatusBar.configurationFile": true,
  "betterStatusBar.loadNpmCommands": false,
  "betterStatusBar.reloadButton": "Refresh Status Bar",
  "betterStatusBar.commands": [
    {
      "id": "3",
      "label": "Git Status",
      "command": "git status",
      "tooltip": "STATUS",
      "color": "blue",
      "terminal": {
        "name": "test",
        "focus": false,
        "reuse": "name",
        "clear": false
      }
    },
    {
      "id": "4",
      "label": "Git Status 2",
      "command": "git status",
      "alignment": 2,
      "priority": 1000,
      "terminal": {
        "name": "test",
        "focus": false,
        "reuse": "name",
        "clear": false
      }
    },
    {
      "id": "split.editor",
      "label": "$(split-horizontal) Split editor",
      "command": "workbench.action.splitEditor",
      "color": "orange",
      "useVsCodeApi": true
    }
  ],
  "betterStatusBar.dropdowns": [
    {
      "id": "5",
      "label": "Dropdown",
      "commands": ["status"],
      "options": {
        "placeholder": "temp",
        "ignoreFocusOut": true,
        "title": "temp"
      }
    }
  ]
}
```

## Configuration File

You can create a `statusBar.json` file to add the settings to a different place than the settings.json file.
The settings in `statusBar.json` overrides the `settings.json` properties.
The commands and dropdowns from `statusBar.json` and `settings.json` are combined.

## Keyboard Shortcuts

Keyboard Shortcuts can be set up for each of the commands/dropdowns that have been created.

- Go to File -> Preferences -> Keyboard Shortcuts to manually set keyboard shortcuts.
- Search for **betterStatusBar**.
  - If the commands are not available/correct, try refreshing the status bar buttons buttons or reloading the window.
- There should now be a list of commands with the specified ids (from settings.json).
- Set the desired keyboard shortcut.

## Config Vars

As seen in the previous example, vars such as `${file}` can be used. Below is a list of each of them and what they do.

| Variable                     | Description                                                             |
| ---------------------------- | ----------------------------------------------------------------------- |
| `${userHome}`                | Path of the user's home folder                                          |
| `${workspaceFolder}`         | Path of the folder opened in VS Code                                    |
| `${workspaceFolderBasename}` | Name of the folder opened in VS Code without any slashes (/)            |
| `${file}`                    | Currently opened file                                                   |
| `${fileWorkspaceFolder}`     | Currently opened file's workspace folder                                |
| `${relativeFile}`            | Currently opened file relative to `workspaceFolder`                     |
| `${relativeFileDirname}`     | Currently opened file's dirname relative to `workspaceFolder`           |
| `${fileBasename}`            | Currently opened file's basename                                        |
| `${fileBasenameNoExtension}` | Currently opened file's basename with no file extension                 |
| `${fileExtname}`             | Currently opened file's extension                                       |
| `${fileDirname}`             | Currently opened file's folder path                                     |
| `${fileDirnameBasename}`     | Currently opened file's folder name                                     |
| `${cwd}`                     | Current working directory                                               |
| `${lineNumber}`              | Currently selected line number in the active file                       |
| `${columnNumber}`            | Currently selected column number in the active file                     |
| `${selectedText}`            | Currently selected text in the active file                              |
| `${execPath}`                | Path to the running VS Code executable                                  |
| `${pathSeparator}` or `${/}` | Character used by the operating system to separate file path components |

## Credits

- [seunlanlege](https://github.com/seunlanlege) for the original extension [vscode-action-buttons](https://github.com/seunlanlege/vscode-action-buttons)
- [VSCode's Extension Samples](https://github.com/microsoft/vscode-extension-samples/tree/master/decorator-sample), which was a huge help to get started
- [All Contributors](../../contributors)
