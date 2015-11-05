/// <reference path="./Extensions.d.ts"/>

'use strict';

import './Object';

function isNullOrEmpty(value: string) {
  return value == null || value === '';
}

function format(format: string, ...args: any[]) {
  if (format != null) {
    format = format.replace(/\{\d+\}/g, x => args[parseInt(x.match(/\d+/)[0])]);
  }

  return format;
}

String.isNullOrEmpty = Object.getValueOrDefault(String.isNullOrEmpty, isNullOrEmpty);
String.format = Object.getValueOrDefault(String.format, format);
