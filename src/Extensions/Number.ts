/// <reference path="./Extensions.d.ts"/>

'use strict';

// jQuery implementation
// see: https://github.com/jquery/jquery/blob/bf48c21d225c31f0f9b5441d95f73615ca3dcfdb/src/core.js#L206
function isNumeric(value: any) {
  return (value - parseFloat(value) + 1) >= 0;
}

Number.isNumeric = Object.getValueOrDefault(Number.isNumeric, isNumeric);
