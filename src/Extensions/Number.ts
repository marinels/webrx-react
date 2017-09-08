export function isNumber(value: any): value is number {
  return typeof value === 'number' || value instanceof Number;
}

// jQuery implementation
// see: https://github.com/jquery/jquery/blob/bf48c21d225c31f0f9b5441d95f73615ca3dcfdb/src/core.js#L206
export function isNumeric(value: any): boolean {
  return value == null ? false : (value - parseFloat(value) + 1) >= 0;
}

export function isInt(value: any): boolean {
  return isNumber(value) && parseInt(value.toFixed(0)) === value;
}

declare global {
  interface NumberConstructor {
    isNumber: typeof isNumber;
    isNumeric: typeof isNumeric;
    isInt: typeof isInt;
  }
}

Number.isNumber = isNumber;
Number.isNumeric = isNumeric;
Number.isInt = isInt;
