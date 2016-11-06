export enum LogLevel {
  All = 0,
  Trace = 10,
  Debug = 20,
  Info = 30,
  Warn = 40,
  Error = 50,
  Fatal = 60,
  Off = 99
}

export function getLevelName(level: LogLevel | number) {
  let name = 'Off  ';

  if (level >= LogLevel.Fatal) {
    name = 'Fatal';
  }
  else if (level >= LogLevel.Error) {
    name = 'Error';
  }
  else if (level >= LogLevel.Warn) {
    name = 'Warn ';
  }
  else if (level >= LogLevel.Info) {
    name = 'Info ';
  }
  else if (level >= LogLevel.Debug) {
    name = 'Debug';
  }
  else if (level >= LogLevel.Trace) {
    name = 'Trace';
  }
  else {
    name = 'All  ';
  }

  return name;
}
