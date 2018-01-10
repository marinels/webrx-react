export interface WebRxReactGlobals {
  readonly DEBUG: boolean;
  readonly PRODUCTION: boolean;
  readonly TEST: boolean;
  readonly WEBPACK_DEV_SERVER: boolean;
  readonly VERSION: string;
}

declare global {
  namespace NodeJS {
    interface Global extends WebRxReactGlobals {
    }
  }

  // also define our globals on the global namespace
  const PRODUCTION: typeof global.PRODUCTION;
  const TEST: typeof global.TEST;
  const WEBPACK_DEV_SERVER: typeof global.WEBPACK_DEV_SERVER;
  const VERSION: typeof global.VERSION;
}

function getValueOrDefault<T>(value: () => T, envValue: (env: any) => T, defaultValue: T) {
  try {
    const val = value();

    if (val != null) {
      return val;
    }
  }
  catch {
    // it's possible that the value selector uses a global variable that isn't defined
  }

  if (global.process != null && global.process.env != null) {
    const val = envValue(global.process.env);

    if (val != null) {
      return val;
    }
  }

  return defaultValue;
}

// we need to untype global to allow us to inject fallbacks
let g: any = global;

// if we don't have a webpack environment then we'll fallback onto defaults
g.DEBUG = getValueOrDefault(() => DEBUG, env => env.NODE_ENV === 'debug', false);
g.PRODUCTION = getValueOrDefault(() => PRODUCTION, env => env.NODE_ENV === 'production', true);
g.TEST = getValueOrDefault(() => TEST, env => env.NODE_ENV === 'test', false);
g.WEBPACK_DEV_SERVER = getValueOrDefault(() => WEBPACK_DEV_SERVER, env => env.NODE_ENV === 'webpack', false);
g.VERSION = getValueOrDefault(() => VERSION, env => env.VERSION, 'BUILD');

// export webrx-react version string
export { version } from './version';
