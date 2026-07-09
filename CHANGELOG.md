# Change Log

## [2.0.0] - 2026-07-09

### Added

- Support multiple configuration files — commands and dropdowns are merged across all files.
- Status bar button labels now update dynamically (e.g. `${fileBasename}` reflects the active file).
- Dropdown labels now resolve variables when opened, not when the extension loads.

### Changed

- User and workspace settings are both applied independently — workspace settings no longer override user settings.
- Priority order: config file > workspace folder settings > workspace settings > user settings.
- Terminal `cwd` now supports variables like `${fileDirname}` and relative paths.

### Fixed

- `find` keyword now automatically discovers configuration files in the workspace, including `.vscode/`.
- Terminal is no longer cleared when it was just created.
- Duplicate command/dropdown detection now works correctly.

## [1.1.0] - 2022-11-09

- Remove unnecessary warning when no commands or dropdowns are configured.

## [1.0.9] - 2022-11-09

- Add defaults for some configuration options.
- Do not error on invalid JSON in configuration file.

## [1.0.8] - 2022-11-02

- Fix bug when no variables are present.

## [1.0.6] - 2022-10-14

- Handle multiple variables correctly.

## [1.0.2] - 2022-08-22

- Fix the `cwd` setting.

## [1.0.1] - 2022-08-22

- Allow the `statusBar.json` configuration file path to be set in user settings.

## [1.0.0] - 2022-08-22

- Initial release.
