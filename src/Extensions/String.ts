/// <reference path="./Extensions.d.ts"/>

'use strict';

import './Object';

function isNullOrEmpty(value: string) {
  return value == null || value === '';
}

function format(format: string, ...args: any[]) {
  if (format) {
    let rx = /\{(\d+)\}/;
    let m = rx.exec(format);

    while (m) {
      let i = parseInt(m[1]);
      if (args.length > i) {
        format = format.replace(m[0], args[i]);
      } else {
        throw 'Out of Range';
      }
      m = rx.exec(format);
    }
  }

  return format;
}

String.isNullOrEmpty = Object.getValueOrDefault(String.isNullOrEmpty, isNullOrEmpty);
String.format = Object.getValueOrDefault(String.format, format);
