## Getting Started

* `npm install` -- _installs all required development packages_

### Gulp Commands

* `gulp help` -- _displays a full listing of all commands and overrides available_
* `gulp` -- _runs the webpack development server with hot module reload_
* `gulp webpack` -- _runs the webpack and builds a debug app bundle_
* `gulp test` -- _builds and runs the unit tests and reports out to the console_
* `gulp watch:mocha` -- _runs the unit tests **watch** mode_

### Basic npm Commands

* `npm start` -- `gulp`
* `npm test` -- `gulp test`

### Visual Studio Code

#### Setup

The following extensions are recommended to be installed:

* `ESLint` -- _provides style rules for javascript files_
* `tslint` -- _provides style rules for TypeScript files_
* `final-newline` -- _automatically inserts a trailing new line in files on save_

Install extensions by hitting `F1` (or `Ctrl+Shift+P`) and typing `ext install`, then typing the extension name to install.

#### Development

This project is configured to allow Visual Studio Code to automatically build and test the project by using the predefined shortcut keys.

* `Ctrl+Shift+B` -- _Build the debug bundle_
* `Ctrl+Shift+T` -- _Run tests_
* `F5` -- _Run tests with debugger attached_

All `gulp` tasks can be run from within Visual Studio by hitting `F1` (or `Ctrl+Shift+P`), hitting `backspace` once to clear the `>` and typing `task` (followed by a space). The available gulp tasks will be displayed and one can be selected using the arrow keys and `Enter`.
