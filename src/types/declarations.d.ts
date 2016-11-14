// webpack defines
declare global {
  const DEBUG: boolean;
  const PRODUCTION: boolean;
  const TEST: boolean;
  const WEBPACK_DEV_SERVER: boolean;
}

// since there are no exports, we must perform an empty export
export { };
