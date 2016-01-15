/// <reference path="./Extensions.d.ts"/>

'use strict';

import './Object';

function isNullOrEmpty(value: string) {
  return value == null || value === '';
}

function stringify(value: any, replacer?: any, space: string | number = 2) {
  return value == null ? null :
    (typeof value === 'object' ? JSON.stringify(value, replacer, space) : value.toString());
}

function format(format: string, ...args: any[]) {
  if (format != null) {
    format = format.replace(/\{\d+\}/g, x => stringify(args[parseInt(x.match(/\d+/)[0])]));
  }

  return format;
}

String.isNullOrEmpty = Object.getValueOrDefault(String.isNullOrEmpty, isNullOrEmpty);
String.stringify = Object.getValueOrDefault(String.stringify, stringify);
String.format = Object.getValueOrDefault(String.format, format);
