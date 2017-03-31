# WebRx-React Framework

> This project is not stable and is in development. If you'd like to contribute, please submit a Pull Request.

WebRx-React is a reactive web UI framework written in [TypeScript](http://www.typescriptlang.org/) that leverages Observables from [RxJS 4](https://github.com/Reactive-Extensions/RxJS), properties and commands from an internal lightweight port of [WebRx](https://github.com/WebRxJS/WebRx), performant rendering from [Facebook's React](https://github.com/facebook/react), and consistent styling from [Twitter's Bootstrap](https://github.com/twbs/bootstrap) (as well as [react-boostrap](https://github.com/react-bootstrap/react-bootstrap) to bridge the gap with React).

This framework can be imported into another TypeScript project (recommended approach), imported into a JavaScript project, or you can alternatively just choose to work directly on a fork of this repository.

`webrx-react` is designed to be a single page web app framework that uses observables to drive rendering React components. This framework comes with a number of foundation components that allow you to compose more complex but consistent looking web apps.

[![Build Status](https://img.shields.io/travis/marinels/webrx-react.svg?branch=develop)](https://travis-ci.org/marinels/webrx-react)
[![npm Version](https://img.shields.io/npm/v/webrx-react.svg)](https://www.npmjs.com/package/webrx-react)
[![npm Downloads](https://img.shields.io/npm/dt/webrx-react.svg)](https://www.npmjs.com/package/webrx-react)
[![npm License](https://img.shields.io/npm/l/webrx-react.svg)](https://www.npmjs.com/package/webrx-react)
[![Dependency Status](https://img.shields.io/versioneye/d/nodejs/webrx-react.svg)](https://www.versioneye.com/nodejs/webrx-react)
[![tslint](https://img.shields.io/badge/tslint-strict-117D6B.svg)](https://github.com/unional/tslint-config-unional/blob/master/style-strict.md)

## Quick Start

This framework comes with a built-in demo that can be viewed in the browser. Simply run `npm install && npm run gulp` to play around with the components built into this framework.

If you have `gulp` installed globally (`npm install -g gulp`) then you can take advantage of the rich build tooling provided by the gulp configuration.

## Using WebRx-React

To start building your own components using WebRx-React framework, you may want to start by looking at the included foundationary components (and component demos). These components and demos offer the best hands on introduction to how everything works together.

### TypeScript

When using typescript to import this framework you can either import the whole API or individual modules.

Import the whole api by adding this line: `import * as wxr from 'webrx-react';`. Now you can access each namespace via the API surface using the `wxr` import alias (i.e., `new wxr.Components.BaseViewModel()`).

Import individual modules directly by supplying a path starting with `webrx-react/src/` (i.e. `import { BaseViewModel } from 'webrx-react/src/Components';`).

### JavaScript

_TBD_

## Development

If you are developing for WebRx-React, the best strategy is to install `gulp` (globally) and run `gulp watch` and use the browser to test out your changes.

You can also run `gulp watch:mocha` if you are working on tests, or `gulp watch:lint` if you want to clean up your source.

You can additionally run `gulp help` to list all of the available gulp commands.
