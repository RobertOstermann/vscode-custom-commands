export type Variables = {
  /** Path of the user's home folder. */
  userHome: string | null;
  /** Path of the folder opened in VS Code. */
  workspaceFolder: string | null;
  /** Name of the folder opened in VS Code without any slashes (/). */
  workspaceFolderBasename: string | null;
  /** Currently opened file. */
  file: string | null;
  /** Currently opened file's workspace folder. */
  fileWorkspaceFolder: string | null;
  /** Currently opened file relative to `workspaceFolder`. */
  relativeFile: string | null;
  /** Currently opened file's dirname relative to `workspaceFolder`. */
  relativeFileDirname: string | null;
  /** Currently opened file's basename. */
  fileBasename: string | null;
  /** Currently opened file's basename with no file extension. */
  fileBasenameNoExtension: string | null;
  /** Currently opened file's extension. */
  fileExtname: string | null;
  /** Currently opened file's folder path. */
  fileDirname: string | null;
  /** Currently opened file's folder name. */
  fileDirnameBasename: string | null;
  /** Current working directory. */
  cwd: string | null;
  /** Currently selected line number in the active file. */
  lineNumber: number | null;
  /** Currently selected column number in the active file. */
  columnNumber: number | null;
  /** Currently selected text in the active file. */
  selectedText: string | null;
  /** Path to the running VS Code executable. */
  execPath: string | null;
  /** Character used by the operating system to separate components in file paths. */
  pathSeparator: string | null;
  /** Shorthand for `pathSeparator`. */
  "/": string | null;
};
